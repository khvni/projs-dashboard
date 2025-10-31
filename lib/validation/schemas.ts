// Zod validation schemas for forms and API endpoints
import { z } from 'zod';

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(200),
  description: z.string().optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  category: z.enum([
    'HOMELESS_CARE',
    'FOOD_DISTRIBUTION',
    'SHELTER_SERVICES',
    'EDUCATION',
    'HEALTHCARE',
    'DISASTER_RELIEF',
    'COMMUNITY_DEVELOPMENT',
    'INFRASTRUCTURE',
    'OTHER',
  ]),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  startDate: z.string().datetime().optional().or(z.date().optional()),
  endDate: z.string().datetime().optional().or(z.date().optional()),
  country: z.string().optional(),
  budget: z.number().positive().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  projectManagerId: z.string().optional(),
  coverImage: z.string().url().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  percentComplete: z.number().min(0).max(100).optional(),
  actualCost: z.number().positive().optional(),
  actualEndDate: z.string().datetime().optional().or(z.date().optional()),
});

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters').max(200),
  description: z.string().optional(),
  projectId: z.string().cuid(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  assignedToId: z.string().cuid().optional(),
  milestoneId: z.string().cuid().optional(),
  estimatedHours: z.number().positive().optional(),
  columnId: z.string().optional(),
  position: z.number().int().default(0),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  percentComplete: z.number().min(0).max(100).optional(),
  actualHours: z.number().positive().optional(),
  completedAt: z.string().datetime().optional().or(z.date().optional()),
});

export const moveTaskSchema = z.object({
  taskId: z.string().cuid(),
  columnId: z.string(),
  position: z.number().int(),
});

// Milestone schemas
export const createMilestoneSchema = z.object({
  name: z.string().min(3, 'Milestone name must be at least 3 characters').max(200),
  description: z.string().optional(),
  projectId: z.string().cuid(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).default('PENDING'),
});

export const updateMilestoneSchema = createMilestoneSchema.partial().extend({
  completedAt: z.string().datetime().optional().or(z.date().optional()),
});

// Project Update schemas
export const createProjectUpdateSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  projectId: z.string().cuid(),
  type: z.enum(['GENERAL', 'MILESTONE', 'ACHIEVEMENT', 'CHALLENGE', 'FINANCIAL']).default('GENERAL'),
  isPublic: z.boolean().default(false),
  images: z.array(z.string().url()).default([]),
});

// Task Comment schema
export const createCommentSchema = z.object({
  taskId: z.string().cuid(),
  content: z.string().min(1, 'Comment cannot be empty'),
});

// Task Attachment schema
export const createAttachmentSchema = z.object({
  taskId: z.string().cuid(),
  name: z.string().min(1),
  url: z.string().url(),
  size: z.number().int().positive(),
  mimeType: z.string(),
});

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'STAKEHOLDER']),
  organization: z.string().optional(),
  phone: z.string().regex(/^\+60\d{9,10}$/, 'Invalid Malaysian phone number. Format: +60123456789').optional(),
  avatar: z.string().url().optional(),
});

export const updateUserSchema = createUserSchema.partial();

// Project Assignment schema
export const createAssignmentSchema = z.object({
  projectId: z.string().cuid(),
  userId: z.string().cuid(),
  role: z.string().min(2, 'Role is required'),
});

// Query/Filter schemas
export const projectFiltersSchema = z.object({
  status: z.array(z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])).optional(),
  category: z.array(z.string()).optional(),
  priority: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])).optional(),
  search: z.string().optional(),
  isPublic: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const taskFiltersSchema = z.object({
  status: z.array(z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'])).optional(),
  priority: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])).optional(),
  assignedToId: z.array(z.string().cuid()).optional(),
  projectId: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

// Type inference from schemas
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type CreateProjectUpdateInput = z.infer<typeof createProjectUpdateSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ProjectFiltersInput = z.infer<typeof projectFiltersSchema>;
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;
