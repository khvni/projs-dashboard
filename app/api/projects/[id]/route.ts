// Projects API - Get, Update, Delete single project
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { updateProjectSchema } from '@/lib/validation/schemas';
import { canEditProject, hasPermission, isAdmin } from '@/lib/auth/permissions';
import { broadcastUpdate } from '@/lib/utils/sse';

// GET /api/projects/[id] - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        projectManager: { select: { id: true, name: true, email: true, avatar: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: [{ columnId: 'asc' }, { position: 'asc' }],
        },
        milestones: {
          include: {
            tasks: { select: { id: true, status: true } },
          },
          orderBy: { dueDate: 'asc' },
        },
        updates: {
          include: {
            author: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
          },
        },
        beneficiaries: true,
        volunteers: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if user has access to this project
    const isAssigned = project.assignments.some(a => a.userId === session.user.id) ||
      project.createdById === session.user.id ||
      project.projectManagerId === session.user.id;

    if (!isAdmin(session.user.role) && !isAssigned && !project.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { assignments: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check permissions
    const isAssigned = project.assignments.some(a => a.userId === session.user.id) ||
      project.createdById === session.user.id ||
      project.projectManagerId === session.user.id;

    if (!canEditProject(session.user.role, isAssigned)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // Convert date strings to Date objects
    const updateData: any = { ...validatedData };
    if (validatedData.startDate) updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate) updateData.endDate = new Date(validatedData.endDate);
    if (validatedData.actualEndDate) updateData.actualEndDate = new Date(validatedData.actualEndDate);

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        projectManager: { select: { id: true, name: true, email: true, avatar: true } },
        tasks: true,
        milestones: true,
      },
    });

    // Broadcast real-time update
    broadcastUpdate('project_updated', {
      projectId: updatedProject.id,
      changes: validatedData,
    });

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    console.error('Error updating project:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete project (soft delete by setting status to CANCELLED)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete projects
    if (!hasPermission(session.user.role, 'projects:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Soft delete: set status to CANCELLED
    await prisma.project.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    });

    // Broadcast real-time update
    broadcastUpdate('project_deleted', { projectId: params.id });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
