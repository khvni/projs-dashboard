// Tasks API - List and Create tasks for a project
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { createTaskSchema } from '@/lib/validation/schemas';
import { hasPermission } from '@/lib/auth/permissions';
import { broadcastUpdate } from '@/lib/utils/sse';

// GET /api/projects/[id]/tasks - List tasks for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: params.id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        milestone: { select: { id: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
      orderBy: [{ columnId: 'asc' }, { position: 'asc' }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/projects/[id]/tasks - Create new task
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role, 'tasks:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse({ ...body, projectId: params.id });

    // Get the highest position in the column
    const maxPositionTask = await prisma.task.findFirst({
      where: {
        projectId: params.id,
        columnId: validatedData.columnId || 'todo',
      },
      orderBy: { position: 'desc' },
    });

    const newPosition = (maxPositionTask?.position ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        position: newPosition,
        createdById: session.user.id,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        columnId: validatedData.columnId || 'todo',
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // Broadcast real-time update
    broadcastUpdate('task_created', {
      taskId: task.id,
      projectId: params.id,
      task,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
