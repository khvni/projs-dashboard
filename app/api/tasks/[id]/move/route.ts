// Task Move API - For drag-and-drop functionality
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { hasPermission } from '@/lib/auth/permissions';
import { broadcastUpdate } from '@/lib/utils/sse';

const moveTaskSchema = z.object({
  columnId: z.string(),
  position: z.number().int(),
  newStatus: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']).optional(),
});

// PATCH /api/tasks/[id]/move - Move task to new column/position
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role, 'tasks:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { columnId, position, newStatus } = moveTaskSchema.parse(body);

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { projectId: true, columnId: true, position: true, status: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const oldColumnId = task.columnId;
    const oldPosition = task.position;

    // Update task position and column using a transaction
    await prisma.$transaction(async (tx) => {
      // If moving to a different column
      if (oldColumnId !== columnId) {
        // Shift tasks in the old column
        await tx.task.updateMany({
          where: {
            projectId: task.projectId,
            columnId: oldColumnId,
            position: { gt: oldPosition },
          },
          data: {
            position: { decrement: 1 },
          },
        });

        // Shift tasks in the new column to make room
        await tx.task.updateMany({
          where: {
            projectId: task.projectId,
            columnId,
            position: { gte: position },
          },
          data: {
            position: { increment: 1 },
          },
        });
      } else {
        // Moving within the same column
        if (position < oldPosition) {
          // Moving up
          await tx.task.updateMany({
            where: {
              projectId: task.projectId,
              columnId,
              position: { gte: position, lt: oldPosition },
            },
            data: {
              position: { increment: 1 },
            },
          });
        } else if (position > oldPosition) {
          // Moving down
          await tx.task.updateMany({
            where: {
              projectId: task.projectId,
              columnId,
              position: { gt: oldPosition, lte: position },
            },
            data: {
              position: { decrement: 1 },
            },
          });
        }
      }

      // Update the moved task
      const updateData: any = {
        columnId,
        position,
      };

      // Update status based on column if newStatus is provided
      if (newStatus) {
        updateData.status = newStatus;

        // If moved to DONE, mark as completed
        if (newStatus === 'DONE') {
          updateData.completedAt = new Date();
          updateData.percentComplete = 100;
        }
      } else {
        // Auto-update status based on column
        const columnToStatus: Record<string, string> = {
          'todo': 'TODO',
          'in-progress': 'IN_PROGRESS',
          'in-review': 'IN_REVIEW',
          'done': 'DONE',
          'blocked': 'BLOCKED',
        };
        if (columnToStatus[columnId]) {
          updateData.status = columnToStatus[columnId];
          if (columnToStatus[columnId] === 'DONE') {
            updateData.completedAt = new Date();
            updateData.percentComplete = 100;
          }
        }
      }

      await tx.task.update({
        where: { id: params.id },
        data: updateData,
      });
    });

    // Fetch updated task
    const updatedTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    // Broadcast real-time update
    broadcastUpdate('task_moved', {
      taskId: params.id,
      projectId: task.projectId,
      fromColumn: oldColumnId,
      toColumn: columnId,
      fromPosition: oldPosition,
      toPosition: position,
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error('Error moving task:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to move task' }, { status: 500 });
  }
}
