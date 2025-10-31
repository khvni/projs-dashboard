// Projects API - List and Create
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { createProjectSchema, projectFiltersSchema } from '@/lib/validation/schemas';
import { hasPermission } from '@/lib/auth/permissions';
import { generateSlug } from '@/lib/utils/format';
import { broadcastUpdate } from '@/lib/utils/sse';

// GET /api/projects - List projects with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = projectFiltersSchema.parse({
      status: searchParams.getAll('status'),
      category: searchParams.getAll('category'),
      priority: searchParams.getAll('priority'),
      search: searchParams.get('search') || undefined,
      isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    });

    const skip = (filters.page - 1) * filters.limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // Role-based filtering
    const canViewAll = hasPermission(session.user.role, 'projects:view:all');
    if (!canViewAll) {
      // Users can only see projects they're assigned to or created
      where.OR = [
        { createdById: session.user.id },
        { projectManagerId: session.user.id },
        { assignments: { some: { userId: session.user.id } } },
      ];
    }

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }
    if (filters.category && filters.category.length > 0) {
      where.category = { in: filters.category };
    }
    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }
    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          projectManager: { select: { id: true, name: true, email: true, avatar: true } },
          tasks: { select: { id: true, status: true, percentComplete: true } },
          milestones: { select: { id: true, status: true } },
          assignments: {
            include: {
              user: { select: { id: true, name: true, email: true, avatar: true } },
            },
          },
        },
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        pages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role, 'projects:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = generateSlug(body.name);
    }

    const validatedData = createProjectSchema.parse(body);

    // Check if slug is unique
    const existingProject = await prisma.project.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: 'Project with this slug already exists' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        createdById: session.user.id,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        projectManager: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    // Broadcast real-time update
    broadcastUpdate('project_created', { projectId: project.id, project });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
