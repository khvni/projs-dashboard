'use client';

import React from 'react';
import { TaskWithRelations } from '@/types';
import { Card, Tag, Avatar, Tooltip, Progress } from 'antd';
import { ClockCircleOutlined, MessageOutlined, PaperClipOutlined, UserOutlined } from '@ant-design/icons';
import { formatDate, formatRelativeTime, getInitials } from '@/lib/utils/format';
import { getTaskPriorityColor, getTaskStatusColor } from '@/lib/utils/progress';

interface TaskCardProps {
  task: TaskWithRelations;
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <Card
      className={`cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 rotate-3' : ''
      }`}
      size="small"
      bordered={false}
      style={{ marginBottom: 0 }}
    >
      {/* Task Title */}
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Priority Tag */}
      <div className="flex items-center gap-2 mb-2">
        <Tag color={getTaskPriorityColor(task.priority)} className="text-xs">
          {task.priority}
        </Tag>
        {task.status !== 'DONE' && task.percentComplete > 0 && (
          <div className="flex-1">
            <Progress
              percent={task.percentComplete}
              size="small"
              showInfo={false}
              strokeColor="#52c41a"
            />
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          {/* Due Date */}
          {task.dueDate && (
            <Tooltip title={`Due: ${formatDate(task.dueDate)}`}>
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                <ClockCircleOutlined />
                {formatRelativeTime(task.dueDate)}
              </span>
            </Tooltip>
          )}

          {/* Comments Count */}
          {task.comments && task.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageOutlined />
              {task.comments.length}
            </span>
          )}

          {/* Attachments Count */}
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <PaperClipOutlined />
              {task.attachments.length}
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignedTo && (
          <Tooltip title={task.assignedTo.name}>
            {task.assignedTo.avatar ? (
              <Avatar size="small" src={task.assignedTo.avatar} />
            ) : (
              <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                {getInitials(task.assignedTo.name)}
              </Avatar>
            )}
          </Tooltip>
        )}
      </div>
    </Card>
  );
}
