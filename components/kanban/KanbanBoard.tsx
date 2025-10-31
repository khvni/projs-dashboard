'use client';

import React, { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskWithRelations, KanbanColumn } from '@/types';
import { KanbanColumnContainer } from './KanbanColumnContainer';
import { TaskCard } from './TaskCard';
import { useKanbanStore } from '@/store/useKanbanStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

interface KanbanBoardProps {
  tasks: TaskWithRelations[];
  projectId: string;
}

const COLUMNS: { id: KanbanColumn; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'gray' },
  { id: 'in-progress', title: 'In Progress', color: 'blue' },
  { id: 'in-review', title: 'In Review', color: 'purple' },
  { id: 'done', title: 'Done', color: 'green' },
  { id: 'blocked', title: 'Blocked', color: 'red' },
];

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const { activeTaskId, setActiveTask, setIsDragging, clearActive } = useKanbanStore();
  const queryClient = useQueryClient();
  const [localTasks, setLocalTasks] = useState(tasks);

  // Use local state to immediately update UI while API call is in flight
  useMemo(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<KanbanColumn, TaskWithRelations[]> = {
      'todo': [],
      'in-progress': [],
      'in-review': [],
      'done': [],
      'blocked': [],
    };

    localTasks.forEach((task) => {
      const columnId = (task.columnId as KanbanColumn) || 'todo';
      if (grouped[columnId]) {
        grouped[columnId].push(task);
      }
    });

    // Sort by position
    Object.keys(grouped).forEach((column) => {
      grouped[column as KanbanColumn].sort((a, b) => a.position - b.position);
    });

    return grouped;
  }, [localTasks]);

  // Mutation for moving tasks
  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, columnId, position, newStatus }: { taskId: string; columnId: string; position: number; newStatus?: string }) => {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId, position, newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to move task');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (error) => {
      message.error('Failed to move task');
      console.error('Error moving task:', error);
      // Revert to server state
      setLocalTasks(tasks);
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = localTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task.id, (task.columnId as KanbanColumn) || 'todo');
      setIsDragging(true);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = localTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const activeColumn = activeTask.columnId || 'todo';

    // Check if over is a column or a task
    let overColumn: string;
    const overTask = localTasks.find((t) => t.id === overId);
    if (overTask) {
      overColumn = overTask.columnId || 'todo';
    } else {
      // Over a column
      overColumn = overId;
    }

    if (activeColumn === overColumn) return;

    // Optimistically update local state
    setLocalTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const activeIndex = newTasks.findIndex((t) => t.id === activeId);

      if (activeIndex !== -1) {
        newTasks[activeIndex] = {
          ...newTasks[activeIndex],
          columnId: overColumn,
        };
      }

      return newTasks;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    clearActive();
    setIsDragging(false);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = localTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine the target column
    let targetColumn: string;
    const overTask = localTasks.find((t) => t.id === overId);
    if (overTask) {
      targetColumn = overTask.columnId || 'todo';
    } else {
      targetColumn = overId;
    }

    // Calculate new position
    const tasksInTargetColumn = localTasks
      .filter((t) => (t.columnId || 'todo') === targetColumn)
      .sort((a, b) => a.position - b.position);

    let newPosition = 0;
    if (overTask) {
      const overIndex = tasksInTargetColumn.findIndex((t) => t.id === overId);
      newPosition = overIndex >= 0 ? tasksInTargetColumn[overIndex].position : 0;
    } else {
      // Dropped on column, put at end
      newPosition = tasksInTargetColumn.length > 0 ? tasksInTargetColumn[tasksInTargetColumn.length - 1].position + 1 : 0;
    }

    // Map column to status
    const columnToStatus: Record<string, string> = {
      'todo': 'TODO',
      'in-progress': 'IN_PROGRESS',
      'in-review': 'IN_REVIEW',
      'done': 'DONE',
      'blocked': 'BLOCKED',
    };

    // Call API to move task
    moveTaskMutation.mutate({
      taskId: activeId,
      columnId: targetColumn,
      position: newPosition,
      newStatus: columnToStatus[targetColumn],
    });
  };

  const activeTask = activeTaskId ? localTasks.find((t) => t.id === activeTaskId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumnContainer
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id]}
            projectId={projectId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-50">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
