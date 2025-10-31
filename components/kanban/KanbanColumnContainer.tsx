'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskWithRelations } from '@/types';
import { SortableTaskCard } from './SortableTaskCard';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Badge } from 'antd';

interface KanbanColumnContainerProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  tasks: TaskWithRelations[];
  projectId: string;
}

export function KanbanColumnContainer({ column, tasks, projectId }: KanbanColumnContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[320px] max-w-[320px] rounded-lg bg-gray-50 p-4 transition-colors ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <Badge count={tasks.length} style={{ backgroundColor: '#52c41a' }} />
        </div>
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          className="text-gray-500"
        />
      </div>

      {/* Tasks */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
