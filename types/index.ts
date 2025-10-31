// Type definitions for the application
import { Prisma } from '@prisma/client';

// Project with all relations
export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    tasks: true;
    milestones: true;
    updates: true;
    assignments: { include: { user: true } };
    createdBy: true;
    projectManager: true;
  };
}>;

// Task with relations
export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    project: true;
    assignedTo: true;
    createdBy: true;
    comments: { include: { author: true } };
    attachments: true;
    milestone: true;
  };
}>;

// Milestone with relations
export type MilestoneWithTasks = Prisma.MilestoneGetPayload<{
  include: {
    tasks: true;
    project: true;
  };
}>;

// Project Update with relations
export type ProjectUpdateWithAuthor = Prisma.ProjectUpdateGetPayload<{
  include: {
    author: true;
    project: true;
  };
}>;

// User with assignments
export type UserWithAssignments = Prisma.UserGetPayload<{
  include: {
    assignments: { include: { project: true } };
    assignedTasks: { include: { project: true } };
  };
}>;

// Simple types for forms
export type ProjectFormData = {
  name: string;
  description?: string;
  category: string;
  status: string;
  priority: string;
  startDate?: Date | string;
  endDate?: Date | string;
  country?: string;
  budget?: number;
  isPublic: boolean;
  tags: string[];
  projectManagerId?: string;
};

export type TaskFormData = {
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date | string;
  assignedToId?: string;
  milestoneId?: string;
  estimatedHours?: number;
};

export type MilestoneFormData = {
  name: string;
  description?: string;
  dueDate?: Date | string;
};

// Real-time update types
export type RealtimeUpdate = {
  type: 'project_updated' | 'task_updated' | 'task_moved' | 'comment_added' | 'milestone_completed';
  data: {
    projectId?: string;
    taskId?: string;
    milestoneId?: string;
    changes?: any;
  };
  timestamp: number;
};

// Kanban column types
export type KanbanColumn = 'todo' | 'in-progress' | 'in-review' | 'done' | 'blocked';

export type TasksByColumn = {
  [key in KanbanColumn]: TaskWithRelations[];
};

// Stats types
export type ProjectStats = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  teamMembers: number;
};

export type TeamWorkload = {
  userId: string;
  userName: string;
  assignedTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalHours: number;
};

// Filter types
export type ProjectFilters = {
  status?: string[];
  category?: string[];
  priority?: string[];
  search?: string;
};

export type TaskFilters = {
  status?: string[];
  priority?: string[];
  assignedToId?: string[];
  projectId?: string;
  search?: string;
};
