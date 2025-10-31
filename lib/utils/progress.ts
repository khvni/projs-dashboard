// Utility functions for calculating project and task progress

import { Task, TaskStatus } from '@prisma/client';

/**
 * Calculate project progress based on task completion
 */
export function calculateProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const totalProgress = tasks.reduce((sum, task) => {
    return sum + task.percentComplete;
  }, 0);

  return Math.round(totalProgress / tasks.length);
}

/**
 * Calculate project progress based on task status
 */
export function calculateProjectProgressByStatus(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE).length;
  return Math.round((completedTasks / tasks.length) * 100);
}

/**
 * Calculate task completion statistics
 */
export function calculateTaskStats(tasks: Task[]) {
  const now = new Date();

  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.DONE).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    blocked: tasks.filter(t => t.status === TaskStatus.BLOCKED).length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== TaskStatus.DONE).length,
  };
}

/**
 * Group tasks by column for kanban board
 */
export function groupTasksByColumn(tasks: Task[]) {
  return {
    todo: tasks.filter(t => t.columnId === 'todo' || (!t.columnId && t.status === TaskStatus.TODO)),
    'in-progress': tasks.filter(t => t.columnId === 'in-progress' || (!t.columnId && t.status === TaskStatus.IN_PROGRESS)),
    'in-review': tasks.filter(t => t.columnId === 'in-review' || (!t.columnId && t.status === TaskStatus.IN_REVIEW)),
    done: tasks.filter(t => t.columnId === 'done' || (!t.columnId && t.status === TaskStatus.DONE)),
    blocked: tasks.filter(t => t.columnId === 'blocked' || (!t.columnId && t.status === TaskStatus.BLOCKED)),
  };
}

/**
 * Calculate estimated vs actual hours
 */
export function calculateHoursStats(tasks: Task[]) {
  const totalEstimated = tasks.reduce((sum, task) => {
    return sum + (task.estimatedHours ? Number(task.estimatedHours) : 0);
  }, 0);

  const totalActual = tasks.reduce((sum, task) => {
    return sum + (task.actualHours ? Number(task.actualHours) : 0);
  }, 0);

  return {
    estimated: totalEstimated,
    actual: totalActual,
    variance: totalActual - totalEstimated,
    percentageVariance: totalEstimated > 0 ? ((totalActual - totalEstimated) / totalEstimated) * 100 : 0,
  };
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === TaskStatus.DONE) return false;
  return new Date(task.dueDate) < new Date();
}

/**
 * Get task priority color
 */
export function getTaskPriorityColor(priority: string): string {
  switch (priority) {
    case 'URGENT':
      return 'red';
    case 'HIGH':
      return 'orange';
    case 'MEDIUM':
      return 'blue';
    case 'LOW':
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Get task status color
 */
export function getTaskStatusColor(status: string): string {
  switch (status) {
    case 'DONE':
      return 'green';
    case 'IN_PROGRESS':
      return 'blue';
    case 'IN_REVIEW':
      return 'purple';
    case 'TODO':
      return 'gray';
    case 'BLOCKED':
      return 'red';
    default:
      return 'gray';
  }
}
