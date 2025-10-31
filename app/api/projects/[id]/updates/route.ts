// Project Updates API - List and Create project updates
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { createProjectUpdateSchema } from '@/lib/validation/schemas';
import { hasPermission } from '@/lib/auth/permissions';
import { broadcastUpdate } from '@/lib/utils/sse';

// GET /api/projects/[id]/updates - List project updates
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await prisma.projectUpdate.findMany({
      where: { projectId: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(updates);
  } catch (error) {
    console.error('Error fetching project updates:', error);
    return NextResponse.json({ error: 'Failed to fetch project updates' }, { status: 500 });
  }
}

// POST /api/projects/[id]/updates - Create new project update
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role, 'projects:edit:assigned')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createProjectUpdateSchema.parse({ ...body, projectId: params.id });

    const update = await prisma.projectUpdate.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    // Broadcast real-time update
    broadcastUpdate('project_update_created', {
      updateId: update.id,
      projectId: params.id,
      update,
    });

    return NextResponse.json(update, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project update:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create project update' }, { status: 500 });
  }
}
