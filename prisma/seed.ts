// Seed script to populate the database with sample data
import { PrismaClient, ProjectStatus, TaskStatus, Priority, ProjectCategory, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  console.log('Creating users...');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@myfundaction.org' },
    update: {},
    create: {
      email: 'admin@myfundaction.org',
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      avatar: null,
    },
  });

  const projectManager1 = await prisma.user.upsert({
    where: { email: 'manager1@myfundaction.org' },
    update: {},
    create: {
      email: 'manager1@myfundaction.org',
      name: 'Ahmad Hassan',
      role: UserRole.PROJECT_MANAGER,
      phone: '+60123456789',
    },
  });

  const projectManager2 = await prisma.user.upsert({
    where: { email: 'manager2@myfundaction.org' },
    update: {},
    create: {
      email: 'manager2@myfundaction.org',
      name: 'Siti Aminah',
      role: UserRole.PROJECT_MANAGER,
      phone: '+60129876543',
    },
  });

  const teamMember1 = await prisma.user.upsert({
    where: { email: 'member1@myfundaction.org' },
    update: {},
    create: {
      email: 'member1@myfundaction.org',
      name: 'Muhammad Ali',
      role: UserRole.TEAM_MEMBER,
    },
  });

  const teamMember2 = await prisma.user.upsert({
    where: { email: 'member2@myfundaction.org' },
    update: {},
    create: {
      email: 'member2@myfundaction.org',
      name: 'Nurul Izzah',
      role: UserRole.TEAM_MEMBER,
    },
  });

  const stakeholder = await prisma.user.upsert({
    where: { email: 'stakeholder@donor.org' },
    update: {},
    create: {
      email: 'stakeholder@donor.org',
      name: 'Donor Representative',
      role: UserRole.STAKEHOLDER,
    },
  });

  console.log('✓ Created 6 users');

  // Create projects
  console.log('Creating projects...');

  const project1 = await prisma.project.create({
    data: {
      name: 'Homeless Care Program 2024',
      slug: 'homeless-care-2024',
      description: 'Comprehensive care program for homeless individuals in Kuala Lumpur',
      category: ProjectCategory.HOMELESS_CARE,
      status: ProjectStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      percentComplete: 65,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isPublic: true,
      country: 'Malaysia',
      budget: 50000,
      actualCost: 32500,
      tags: ['urgent', 'homeless', 'kuala-lumpur'],
      createdById: superAdmin.id,
      projectManagerId: projectManager1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Ramadan Food Distribution',
      slug: 'ramadan-food-distribution-2024',
      description: 'Food distribution program during Ramadan for underprivileged families',
      category: ProjectCategory.FOOD_DISTRIBUTION,
      status: ProjectStatus.PLANNING,
      priority: Priority.URGENT,
      percentComplete: 25,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-04-30'),
      isPublic: true,
      country: 'Malaysia',
      budget: 30000,
      tags: ['ramadan', 'food', 'charity'],
      createdById: superAdmin.id,
      projectManagerId: projectManager2.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Rural School Education Fund',
      slug: 'rural-school-education-2024',
      description: 'Providing educational resources to rural schools in Malaysia',
      category: ProjectCategory.EDUCATION,
      status: ProjectStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      percentComplete: 45,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-11-30'),
      isPublic: true,
      country: 'Malaysia',
      budget: 75000,
      actualCost: 33750,
      tags: ['education', 'rural', 'schools'],
      createdById: superAdmin.id,
      projectManagerId: projectManager1.id,
    },
  });

  console.log('✓ Created 3 projects');

  // Create tasks for project 1
  console.log('Creating tasks...');

  const tasks1 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Set up shelter locations',
        description: 'Identify and secure 3 locations for temporary shelters',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        percentComplete: 100,
        position: 0,
        columnId: 'done',
        projectId: project1.id,
        createdById: projectManager1.id,
        assignedToId: teamMember1.id,
        completedAt: new Date('2024-01-15'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Recruit volunteers',
        description: 'Recruit 20 volunteers for the program',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        percentComplete: 70,
        position: 0,
        columnId: 'in-progress',
        projectId: project1.id,
        createdById: projectManager1.id,
        assignedToId: teamMember2.id,
        dueDate: new Date('2024-11-15'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Prepare food supplies',
        description: 'Organize weekly food supply deliveries',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        percentComplete: 0,
        position: 0,
        columnId: 'todo',
        projectId: project1.id,
        createdById: projectManager1.id,
        dueDate: new Date('2024-11-20'),
      },
    }),
  ]);

  // Create tasks for project 2
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Identify beneficiary families',
        description: 'Create list of 500 families for food distribution',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.URGENT,
        percentComplete: 60,
        position: 0,
        columnId: 'in-progress',
        projectId: project2.id,
        createdById: projectManager2.id,
        assignedToId: teamMember1.id,
        dueDate: new Date('2024-02-28'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Source food suppliers',
        description: 'Contact and negotiate with food suppliers',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        percentComplete: 0,
        position: 0,
        columnId: 'todo',
        projectId: project2.id,
        createdById: projectManager2.id,
        dueDate: new Date('2024-03-05'),
      },
    }),
  ]);

  console.log('✓ Created tasks');

  // Create milestones
  console.log('Creating milestones...');

  await Promise.all([
    prisma.milestone.create({
      data: {
        name: 'Phase 1: Setup Complete',
        description: 'All shelter locations secured and volunteers trained',
        dueDate: new Date('2024-03-31'),
        status: 'COMPLETED',
        completedAt: new Date('2024-03-28'),
        projectId: project1.id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'Phase 2: Operations Running',
        description: 'All shelters operational with full services',
        dueDate: new Date('2024-06-30'),
        status: 'IN_PROGRESS',
        projectId: project1.id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'Beneficiary Registration',
        description: 'Complete registration of all beneficiary families',
        dueDate: new Date('2024-03-10'),
        status: 'IN_PROGRESS',
        projectId: project2.id,
      },
    }),
  ]);

  console.log('✓ Created milestones');

  // Create project assignments
  console.log('Creating project assignments...');

  await Promise.all([
    prisma.projectAssignment.create({
      data: {
        projectId: project1.id,
        userId: teamMember1.id,
        role: 'Team Lead',
      },
    }),
    prisma.projectAssignment.create({
      data: {
        projectId: project1.id,
        userId: teamMember2.id,
        role: 'Volunteer Coordinator',
      },
    }),
    prisma.projectAssignment.create({
      data: {
        projectId: project2.id,
        userId: teamMember1.id,
        role: 'Logistics Coordinator',
      },
    }),
  ]);

  console.log('✓ Created project assignments');

  // Create project updates
  console.log('Creating project updates...');

  await Promise.all([
    prisma.projectUpdate.create({
      data: {
        title: 'Shelter Setup Progress',
        content: 'We have successfully secured all three shelter locations and completed basic renovations. Teams are now working on setting up amenities.',
        type: 'GENERAL',
        isPublic: true,
        projectId: project1.id,
        authorId: projectManager1.id,
      },
    }),
    prisma.projectUpdate.create({
      data: {
        title: 'Milestone Achievement',
        content: 'Phase 1 completed ahead of schedule! All volunteers have been trained and shelters are ready to receive beneficiaries.',
        type: 'MILESTONE',
        isPublic: true,
        projectId: project1.id,
        authorId: projectManager1.id,
      },
    }),
  ]);

  console.log('✓ Created project updates');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
