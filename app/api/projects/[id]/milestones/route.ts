// Milestones API - List and Create milestones for a project
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { createMilestoneSchema } from '@/lib/validation/schemas';
import { hasPermission } from '@/lib/auth/permissions';
import { broadcastUpdate } from '@/lib/utils/sse';

// GET /api/projects/[id]/milestones - List milestones for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId: params.id },
      include: {
        tasks: {
          select: { id: true, title: true, status: true, percentComplete: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

// POST /api/projects/[id]/milestones - Create new milestone
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role, 'tasks:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createMilestoneSchema.parse({ ...body, projectId: params.id });

    const milestone = await prisma.milestone.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
      include: {
        tasks: true,
      },
    });

    // Broadcast real-time update
    broadcastUpdate('milestone_created', {
      milestoneId: milestone.id,
      projectId: params.id,
      milestone,
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error: any) {
    console.error('Error creating milestone:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}
