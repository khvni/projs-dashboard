# Live Project Tracking Dashboard - MyFundAction

## 1. PROJECT CONTEXT

### About MyFundAction
MyFundAction (Yayasan Kebajikan Muslim) is a youth-driven Malaysian NGO established in 2014, dedicated to helping low-income groups, underprivileged communities, and senior citizens. The organization operates globally across 5 countries with:
- **18,000+ active volunteers** (90% youth)
- **180 full-time staff members**
- **Global operations** in Malaysia, New Zealand, Egypt, Indonesia, Africa, and Japan
- **Islamic charity focus** including programs like Homeless Care, food distribution, shelter services, and more

### Problem Statement
MyFundAction manages **20-30 simultaneous ongoing projects** at any given time across multiple countries and causes. Currently, project tracking is:
- **Fragmented**: Projects tracked in multiple spreadsheets, Trello boards, and ad-hoc tools
- **Not real-time**: Status updates happen manually, causing delays in decision-making
- **Opaque to stakeholders**: Donors, partners, and beneficiaries have no visibility into project progress
- **Difficult to manage**: No unified view of all projects, tasks, milestones, and team assignments
- **Poor accountability**: Hard to track who's responsible for what and when tasks are due
- **Limited reporting**: Cannot easily generate progress reports for funders and stakeholders

The organization needs a **centralized, real-time project tracking system** with both internal dashboards for operations teams and public-facing views for stakeholders to see project impact and progress.

### Current State & Pain Points
- Projects scattered across Google Sheets, Trello, Asana, and email threads
- No real-time updates - staff must manually update status weekly
- Volunteers often unaware of project status or their assigned tasks
- Donors cannot see live progress of funded projects
- No integration with beneficiary or volunteer management systems
- Difficult to track milestone completion and percentage progress
- Limited mobile access for field teams
- No drag-and-drop task management
- Cannot visualize project timelines or dependencies

### Success Metrics for MVP
- **Project creation**: < 5 minutes per project (vs. 30+ minutes currently)
- **Real-time updates**: Status changes visible to all users within 3 seconds
- **User adoption**: 90%+ of project managers using within 30 days
- **Stakeholder visibility**: 80%+ of donors use public dashboards monthly
- **Task completion rate**: 20% improvement in on-time task delivery
- **Reporting**: Generate progress reports in < 5 seconds
- **Mobile usage**: 60%+ of status updates from mobile devices

---

## 2. TECHNICAL ARCHITECTURE

### Tech Stack

**Frontend:**
- Next.js 15 (App Router) with React 19
- TypeScript (strict mode)
- Ant Design (primary UI framework - tables, forms, layouts)
- Tailwind CSS (utility styling)
- dnd-kit (drag-and-drop for kanban boards)
- Recharts or Chart.js (progress visualization)
- React Hook Form + Zod validation

**Backend:**
- Next.js API Routes (serverless)
- Server-Sent Events (SSE) for real-time updates
- Prisma ORM
- Vercel Postgres (development)
- Supabase PostgreSQL (production - cost-effective at scale)

**Authentication:**
- NextAuth v5 (Auth.js)
- Role-based access control (RBAC)
- Roles: Super Admin, Admin, Project Manager, Team Member, Stakeholder (read-only)

**File Storage:**
- Vercel Blob (development)
- Cloudinary (production - project images, documents)

**Email/Notifications:**
- Resend for email notifications
- Web Push API for browser notifications

**State Management:**
- Zustand for global UI state (drag-and-drop state, filters)
- React Query for server state management (projects, tasks)

**Real-Time Communication:**
- Server-Sent Events (SSE) for one-way real-time updates
- Fallback to WebSockets if SSE not supported

**Testing:**
- Vitest for unit/integration tests
- Playwright MCP for E2E testing

**Analytics & Monitoring:**
- Vercel Analytics
- Sentry for error tracking
- Posthog for user behavior analytics

### Suggested Prisma Schema

```prisma
// schema.prisma

model Project {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Basic Information
  name          String
  description   String?  @db.Text
  slug          String   @unique

  // Project Details
  status        ProjectStatus @default(PLANNING)
  priority      Priority @default(MEDIUM)
  percentComplete Int @default(0) // 0-100

  // Dates
  startDate     DateTime?
  endDate       DateTime?
  actualEndDate DateTime?

  // Visibility
  isPublic      Boolean @default(false) // Public-facing dashboard

  // Metadata
  category      ProjectCategory
  country       String? // Malaysia, New Zealand, etc.
  budget        Decimal? @db.Decimal(12, 2)
  actualCost    Decimal? @db.Decimal(12, 2)

  // Media
  coverImage    String?
  gallery       String[] // Array of image URLs

  // Relationships
  tasks         Task[]
  milestones    Milestone[]
  updates       ProjectUpdate[]
  assignments   ProjectAssignment[]
  beneficiaries ProjectBeneficiary[]
  volunteers    ProjectVolunteer[]

  createdBy     User   @relation("ProjectCreator", fields: [createdById], references: [id])
  createdById   String

  projectManager User?  @relation("ProjectManager", fields: [projectManagerId], references: [id])
  projectManagerId String?

  // Tags
  tags          String[] // ["urgent", "donor-funded", "ramadan-2024"]

  @@index([status])
  @@index([category])
  @@index([slug])
  @@index([isPublic])
}

model Task {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  title         String
  description   String?  @db.Text
  status        TaskStatus @default(TODO)
  priority      Priority @default(MEDIUM)

  // Task Details
  percentComplete Int @default(0) // 0-100
  estimatedHours Decimal? @db.Decimal(6, 2)
  actualHours    Decimal? @db.Decimal(6, 2)

  // Dates
  dueDate       DateTime?
  completedAt   DateTime?

  // Position (for kanban drag-and-drop)
  position      Int @default(0)
  columnId      String? // "todo", "in-progress", "done"

  // Relationships
  project       Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId     String

  assignedTo    User?   @relation("TaskAssignee", fields: [assignedToId], references: [id])
  assignedToId  String?

  createdBy     User    @relation("TaskCreator", fields: [createdById], references: [id])
  createdById   String

  parentTask    Task?   @relation("SubTasks", fields: [parentTaskId], references: [id])
  parentTaskId  String?
  subTasks      Task[]  @relation("SubTasks")

  comments      TaskComment[]
  attachments   TaskAttachment[]

  milestone     Milestone? @relation(fields: [milestoneId], references: [id])
  milestoneId   String?

  @@index([projectId])
  @@index([status])
  @@index([assignedToId])
  @@index([milestoneId])
  @@index([columnId, position])
}

model Milestone {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  name          String
  description   String?  @db.Text
  dueDate       DateTime?
  completedAt   DateTime?
  status        MilestoneStatus @default(PENDING)

  project       Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId     String

  tasks         Task[]

  @@index([projectId])
  @@index([status])
}

model ProjectUpdate {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  title         String
  content       String   @db.Text
  type          UpdateType @default(GENERAL)

  // Visibility
  isPublic      Boolean @default(false) // Show on public dashboard

  project       Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId     String

  author        User    @relation(fields: [authorId], references: [id])
  authorId      String

  images        String[] // Array of image URLs

  @@index([projectId])
  @@index([isPublic])
  @@index([createdAt])
}

model ProjectAssignment {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  role          String // "Project Manager", "Team Lead", "Contributor"

  project       Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId     String

  user          User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
}

model ProjectBeneficiary {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  // Link to beneficiary system
  beneficiaryId String
  beneficiaryName String // Cached for display

  project       Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId     String

  impact        String? @db.Text // How this beneficiary was impacted

  @@index([projectId])
  @@index([beneficiaryId])
}

model ProjectVolunteer {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  // Link to volunteer system
  volunteerId   String
  volunteerName String // Cached for display

  project       Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId     String

  hoursContributed Decimal? @db.Decimal(6, 2)

  @@index([projectId])
  @@index([volunteerId])
}

model TaskComment {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  content       String   @db.Text

  task          Task    @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId        String

  author        User    @relation(fields: [authorId], references: [id])
  authorId      String

  @@index([taskId])
}

model TaskAttachment {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  name          String
  url           String
  size          Int      // bytes
  mimeType      String

  task          Task    @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId        String

  uploadedBy    User    @relation(fields: [uploadedById], references: [id])
  uploadedById  String
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  role          UserRole
  organization  String?
  phone         String?
  avatar        String?

  // Relations
  createdProjects Project[] @relation("ProjectCreator")
  managedProjects Project[] @relation("ProjectManager")
  assignments   ProjectAssignment[]
  assignedTasks Task[]    @relation("TaskAssignee")
  createdTasks  Task[]    @relation("TaskCreator")
  updates       ProjectUpdate[]
  comments      TaskComment[]
  attachments   TaskAttachment[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum ProjectStatus {
  PLANNING
  IN_PROGRESS
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
  BLOCKED
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ProjectCategory {
  HOMELESS_CARE
  FOOD_DISTRIBUTION
  SHELTER_SERVICES
  EDUCATION
  HEALTHCARE
  DISASTER_RELIEF
  COMMUNITY_DEVELOPMENT
  INFRASTRUCTURE
  OTHER
}

enum UpdateType {
  GENERAL
  MILESTONE
  ACHIEVEMENT
  CHALLENGE
  FINANCIAL
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  PROJECT_MANAGER
  TEAM_MEMBER
  STAKEHOLDER
}
```

### Authentication & Authorization Strategy

**Roles & Permissions:**
- **Super Admin**: Full system access, user management, settings
- **Admin**: Manage all projects, assign project managers, view all reports
- **Project Manager**: Create/edit assigned projects, manage tasks, assign team members
- **Team Member**: View assigned projects, update task status, log time
- **Stakeholder**: Read-only access to public projects and reports

**Row-Level Security:**
- Users can only see projects they're assigned to (unless Admin+)
- Project Managers have full control over their projects
- Stakeholders see only public projects
- Audit logs for all project/task modifications

### API Design Patterns

**RESTful API Routes:**
```
/api/projects
  GET    - List projects (paginated, filtered)
  POST   - Create project

/api/projects/[id]
  GET    - Get single project
  PATCH  - Update project
  DELETE - Soft delete (archive)

/api/projects/[id]/tasks
  GET    - List tasks for project
  POST   - Create task

/api/projects/[id]/milestones
  GET    - List milestones
  POST   - Create milestone

/api/projects/[id]/updates
  GET    - List project updates
  POST   - Create update

/api/projects/[id]/progress
  GET    - Calculate overall project progress

/api/projects/public
  GET    - List public projects for stakeholders

/api/tasks
  GET    - List tasks (paginated, filtered)
  POST   - Create task

/api/tasks/[id]
  GET    - Get single task
  PATCH  - Update task (status, position, etc.)
  DELETE - Delete task

/api/tasks/[id]/move
  PATCH  - Move task (drag-and-drop position update)

/api/tasks/[id]/comments
  GET    - List comments
  POST   - Add comment

/api/realtime/updates
  GET    - SSE endpoint for real-time updates

/api/reports/project-status
  GET    - Generate project status report

/api/reports/team-workload
  GET    - Generate team workload report
```

**Server-Sent Events (SSE) API:**
```
/api/realtime/updates
  - Streams real-time updates to connected clients
  - Events: project_updated, task_updated, task_moved, comment_added
```

---

## 3. MVP FEATURE SPECIFICATION

### Must-Have (Phase 1 - MVP Demo)

**Project Management:**
- ✅ Create new project with comprehensive form
- ✅ View project list (table + kanban views)
- ✅ View project details page (overview, tasks, milestones, updates)
- ✅ Edit project information
- ✅ Update project status and percentage completion
- ✅ Archive/complete projects
- ✅ Upload project cover image and gallery

**Task Management:**
- ✅ Create tasks within projects
- ✅ Drag-and-drop kanban board (TODO, In Progress, Done)
- ✅ Assign tasks to team members
- ✅ Update task status, priority, due date
- ✅ Add task descriptions and comments
- ✅ Upload task attachments
- ✅ Track task completion percentage

**Milestone Tracking:**
- ✅ Create milestones with due dates
- ✅ Link tasks to milestones
- ✅ Track milestone completion status
- ✅ View milestone timeline

**Real-Time Updates:**
- ✅ Server-Sent Events (SSE) for live updates
- ✅ Auto-refresh project progress when tasks change
- ✅ Live notification when tasks are moved/updated
- ✅ Real-time team member presence indicators

**Public Dashboard:**
- ✅ Public-facing project view (read-only)
- ✅ Show project progress, milestones, updates
- ✅ Hide sensitive information (budget, internal notes)
- ✅ Shareable project URL

**Progress Visualization:**
- ✅ Overall project completion percentage
- ✅ Task completion bar charts
- ✅ Milestone timeline view
- ✅ Project status dashboard (pie charts, bar graphs)

**Team Management:**
- ✅ Assign team members to projects
- ✅ Assign tasks to specific users
- ✅ View team workload
- ✅ Track individual contributions

**Basic Reporting:**
- ✅ Project status summary
- ✅ Task completion rates
- ✅ Overdue tasks report
- ✅ Team workload report

**Authentication:**
- ✅ Email/password login
- ✅ Role-based access control
- ✅ User management (Admin only)

**Mobile-Friendly:**
- ✅ Responsive design (mobile-first)
- ✅ Touch-friendly drag-and-drop
- ✅ Quick task status updates

### Should-Have (Phase 2 - Post-Demo)

- Gantt chart view for project timeline
- Dependencies between tasks
- Recurring tasks
- Task templates
- Time tracking per task
- Advanced filtering and search
- Email notifications for task assignments/deadlines
- Slack/WhatsApp integration
- Export reports to PDF/Excel
- Custom project fields
- Project cloning
- Advanced analytics dashboard
- File version control
- Task history/audit trail
- Batch task operations

### Could-Have (Future Enhancements)

- Mobile app (React Native)
- Offline support (PWA)
- Calendar view integration
- Resource allocation planning
- Budget tracking and forecasting
- AI-powered task prioritization
- Voice notes for task updates
- Project portfolio management
- Multi-project dashboards
- Custom workflows/automations
- Integration with accounting systems
- Beneficiary impact tracking (advanced)
- Volunteer hour tracking (advanced)
- Donor portal with funding visibility

### Out of Scope

- Payment processing (handled by CRM)
- Accounting/invoicing
- HR management
- Inventory tracking
- Donation tracking (CRM handles this)
- Beneficiary case management (separate system)
- Volunteer scheduling (separate system)

---

## 4. MCP SERVER UTILIZATION GUIDE

### sequential-thinking
**Use for:**
- Complex architectural decisions (e.g., "Should we use SSE or WebSockets for real-time updates?")
- Database schema design validation
- Performance optimization strategies
- Debugging complex drag-and-drop state issues
- Planning real-time architecture

**Example:**
```
Use sequential-thinking to analyze: "What's the best approach for implementing real-time updates for 20-30 simultaneous projects with 100+ users?"
```

### filesystem
**Use for:**
- Reading multiple component files simultaneously
- Batch file operations (creating components, utilities)
- Project structure analysis
- Finding specific code patterns across files

### fetch
**Use for:**
- Researching Next.js 15 SSE implementation
- Finding dnd-kit examples
- Studying Ant Design table and layout patterns
- Looking up Recharts documentation

### deepwiki
**Use for:**
- Exploring Worklenz repo (github.com/Worklenz/worklenz) - React + Express + Socket.IO architecture
- Studying Build-Project-Management-Dashboard (github.com/Hamed-Hasan/Build-Project-Management-Dashboard)
- Understanding TailAdmin dashboard patterns

**Example repos to explore:**
- Worklenz/worklenz - Real-time project management with Socket.IO
- Hamed-Hasan/Build-Project-Management-Dashboard - Dashboard UI patterns
- TailAdmin/free-nextjs-admin-dashboard - Dashboard layout inspiration

### allpepper-memory-bank
**Use for:**
- Storing project decisions and architecture choices
- Documenting custom patterns and conventions
- Tracking SSE implementation strategies
- Recording learned lessons during development

**Files to create:**
- `architecture-decisions.md` - Key technical choices
- `realtime-strategy.md` - SSE vs WebSockets decision
- `drag-and-drop-patterns.md` - dnd-kit implementation notes
- `public-dashboard-design.md` - Public vs private view separation

### playwright (MCP)
**Use for:**
- E2E testing critical user flows:
  - Project creation workflow
  - Drag-and-drop task movement
  - Real-time update propagation
  - Public dashboard rendering
  - Login and authentication
- Automated visual regression testing
- Screenshot generation for documentation

**Example test:**
```typescript
// Test drag-and-drop functionality
test('drag task from TODO to IN_PROGRESS', async ({ page }) => {
  await page.goto('/projects/test-project');

  const task = page.locator('[data-task-id="task-1"]');
  const inProgressColumn = page.locator('[data-column="in-progress"]');

  await task.dragTo(inProgressColumn);

  // Verify task moved
  await expect(inProgressColumn.locator('[data-task-id="task-1"]')).toBeVisible();
});
```

### puppeteer
**Use for:**
- Browser automation for testing
- Generating PDF project reports
- Screenshot capture for stakeholder reports

---

## 5. REFERENCE IMPLEMENTATIONS

### GitHub Repositories to Clone/Reference

**Primary Reference:**
1. **Worklenz** - https://github.com/Worklenz/worklenz
   - Architecture: React frontend + Express backend + Socket.IO real-time
   - Features: Drag-and-drop kanban, project tracking, time tracking
   - Study their Socket.IO implementation for real-time updates
   - **Note**: Use their concepts but adapt to Next.js + SSE

2. **Build Project Management Dashboard** - https://github.com/Hamed-Hasan/Build-Project-Management-Dashboard
   - Dashboard UI patterns
   - Project tracking concepts
   - Task management workflows

**Next.js Templates:**
3. **TailAdmin Next.js** - https://github.com/TailAdmin/free-nextjs-admin-dashboard
   - Use as base template for admin dashboard
   - Chart components, table layouts
   - Responsive dashboard patterns

4. **Next Shadcn Dashboard Starter** - https://github.com/Kiranism/next-shadcn-dashboard-starter
   - Modern Next.js 15 patterns
   - Clean architecture

**Drag-and-Drop Examples:**
5. **dnd-kit Examples** - https://github.com/clauderic/dnd-kit/tree/master/stories
   - Kanban board examples
   - Sortable lists
   - Multi-container drag-and-drop

### Similar Projects to Study

- **Jira/Linear** (concepts) - Modern project tracking UX
- **Trello** (concepts) - Drag-and-drop kanban boards
- **Asana** (concepts) - Milestone tracking and progress visualization
- **Monday.com** (concepts) - Real-time collaboration
- **Worklenz** (open-source) - Full implementation reference

### Recommended Tutorials/Docs

- **Next.js 15 App Router**: https://nextjs.org/docs
- **Server-Sent Events in Next.js**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming
- **dnd-kit**: https://docs.dndkit.com/
- **Ant Design**: https://ant.design/components/overview
- **Prisma with Next.js**: https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql
- **NextAuth v5**: https://authjs.dev/getting-started/installation
- **Recharts**: https://recharts.org/en-US/

---

## 6. DATA MIGRATION & INTEGRATION

### Import from Existing Tools

**Current Data Sources:**
- Google Sheets (project tracking spreadsheets)
- Trello boards (various projects)
- Asana workspaces (some projects)
- Email threads (ad-hoc updates)
- Estimated 20-30 active projects across all sources

**Migration Strategy:**

**Phase 1: Data Audit**
1. Export all Trello boards as JSON
2. Export Google Sheets as CSV
3. Document Asana structure
4. Create mapping document: Old tools → Project model
5. Identify missing required fields
6. Document data quality issues

**Phase 2: Import Utilities**
Create import endpoints for:
- Trello JSON import
- CSV import (Google Sheets format)
- Manual entry for Asana data

**Example Trello Import:**
```typescript
// lib/import/trello-importer.ts
export async function importTrelloBoard(boardJson: any) {
  // Map Trello board to Project
  const project = {
    name: boardJson.name,
    description: boardJson.desc,
    status: mapTrelloStatus(boardJson),
  };

  // Map Trello lists to task columns
  const tasks = boardJson.cards.map((card: any) => ({
    title: card.name,
    description: card.desc,
    status: mapTrelloList(card.idList),
    dueDate: card.due,
  }));

  return { project, tasks };
}
```

**Phase 3: Validation**
- Validate imported data with Zod schemas
- Check for duplicate projects
- Verify user assignments exist
- Report validation errors

**Data Validation Rules:**
- Required fields: name, status, category
- Date validation: startDate <= endDate
- Percentage: 0-100 range
- User assignments: Must reference existing users

### Integration with Other MyFundAction Systems

**Volunteer Management Integration:**
- Link projects to volunteers (volunteer assignments)
- Track volunteer hours per project
- Sync volunteer availability
- API endpoint: `/api/projects/[id]/volunteers`

**Beneficiary System Integration:**
- Link projects to beneficiaries (impact tracking)
- Show beneficiaries affected per project
- Cross-reference services provided
- API endpoint: `/api/projects/[id]/beneficiaries`

**CRM Integration:**
- Link projects to donors (funding source)
- Track project funding status
- Show donor impact on public dashboard
- API endpoint: `/api/projects/[id]/donors`

**Shared Data Models:**
```typescript
// types/shared.ts (shared across all 6 projects)
export interface ProjectImpact {
  projectId: string;
  beneficiariesServed: number;
  volunteersInvolved: number;
  hoursContributed: number;
  fundsAllocated: number;
}

export interface CrossSystemLink {
  sourceSystem: 'volunteer' | 'beneficiary' | 'crm';
  sourceId: string;
  targetSystem: 'projects';
  targetId: string;
  relationshipType: string;
}
```

**Real-Time Sync:**
- When volunteer is assigned to project → notify volunteer system
- When beneficiary is served → update beneficiary system
- When project is funded → sync with CRM

---

## 7. GIT WORKTREE WORKFLOW

### Setting Up Worktree for Isolated Development

**Why Worktrees?**
- Develop all 6 projects simultaneously with separate Claude Code instances
- Keep main repository clean
- Switch between projects without stashing changes
- Easy testing of cross-project integrations

**Create Worktree:**
```bash
# From main repository root: /Users/khani/Desktop/projs/myfundaction-protos

# Create worktree for projects dashboard
git worktree add -b projs-dashboard/main ../myfundaction-worktrees/projs-dashboard projs-dashboard

# Navigate to worktree
cd ../myfundaction-worktrees/projs-dashboard

# Open in VS Code (or your editor)
code .

# Start Claude Code in this directory
claude-code
```

**Worktree Structure:**
```
myfundaction-protos/          (main repo)
├── beneficiary/
├── volunteer-mgmt/
├── projs-dashboard/          (this project)
└── ...

myfundaction-worktrees/       (worktrees)
├── beneficiary/
├── volunteer-mgmt/
├── projs-dashboard/          (isolated working tree)
└── ...
```

### Branch Naming Conventions

**Main branch per project:**
- `beneficiary/main`
- `volunteer-mgmt/main`
- `projs-dashboard/main`
- etc.

**Feature branches:**
- `projs-dashboard/feat/realtime-sse`
- `projs-dashboard/feat/drag-drop-kanban`
- `projs-dashboard/feat/public-dashboard`
- `projs-dashboard/fix/task-position-bug`
- `projs-dashboard/chore/update-deps`

**Conventional Commits:**
```bash
git commit -m "feat(projs-dashboard): implement SSE for real-time updates"
git commit -m "feat(projs-dashboard): add drag-and-drop kanban board"
git commit -m "fix(projs-dashboard): correct task position calculation"
git commit -m "docs(projs-dashboard): update API documentation"
git commit -m "test(projs-dashboard): add E2E tests for drag-and-drop"
```

### Commit Strategy

**IMPORTANT: Commit frequently as you build!**

**After each significant change:**
```bash
# Add files
git add .

# Commit with descriptive message
git commit -m "feat(projs-dashboard): implement project list with real-time updates"

# Push to remote (for backup and collaboration)
git push origin projs-dashboard/main
```

**Commit Checklist:**
- ✅ After creating new components
- ✅ After implementing new features
- ✅ After writing tests
- ✅ After fixing bugs
- ✅ Before switching to another task
- ✅ At least 3-5 times per hour during active development

**Good commit messages:**
```
✅ "feat(projs-dashboard): add Prisma schema for projects, tasks, milestones"
✅ "feat(projs-dashboard): create kanban board with dnd-kit"
✅ "feat(projs-dashboard): implement SSE endpoint for real-time updates"
✅ "fix(projs-dashboard): correct drag-and-drop position persistence"
✅ "test(projs-dashboard): add unit tests for project progress calculation"
```

**Bad commit messages:**
```
❌ "update"
❌ "wip"
❌ "changes"
❌ "fix stuff"
```

### TodoWrite Tool Usage

**Use TodoWrite throughout development:**

```typescript
// Example: Breaking down kanban board implementation
TodoWrite([
  { content: "Create Prisma schema for Project and Task models", status: "completed", activeForm: "Creating Prisma schema" },
  { content: "Set up dnd-kit kanban board component", status: "in_progress", activeForm: "Setting up kanban board" },
  { content: "Implement drag-and-drop handlers", status: "pending", activeForm: "Implementing drag handlers" },
  { content: "Add API route for task position updates", status: "pending", activeForm: "Adding position update API" },
  { content: "Implement SSE for real-time task updates", status: "pending", activeForm: "Implementing SSE updates" },
  { content: "Write E2E tests for drag-and-drop", status: "pending", activeForm: "Writing E2E tests" },
]);
```

**Update todos as you progress** - mark completed, add new ones as discovered.

---

## 8. DEPLOYMENT STRATEGY

### Vercel Project Setup

**Create New Vercel Project:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from projs-dashboard directory
cd /path/to/worktree/projs-dashboard
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: myfundaction-projects
# - Directory: ./
# - Build command: next build
# - Output directory: .next
# - Development command: next dev
```

**Vercel Project Settings:**
- **Framework Preset**: Next.js
- **Node Version**: 18.x or 20.x
- **Build Command**: `next build`
- **Install Command**: `npm install` or `yarn install`
- **Root Directory**: `./` (or `projs-dashboard/` if deploying from main repo)

### Environment Variables

**Required for Development (.env.local):**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/projects_dev"
DIRECT_URL="postgresql://user:password@localhost:5432/projects_dev" # Prisma migrations

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_token_here"

# Email (Resend)
RESEND_API_KEY="re_your_key_here"

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_your_key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Integration URLs
BENEFICIARY_API_URL="http://localhost:3001/api"
VOLUNTEER_API_URL="http://localhost:3002/api"
CRM_API_URL="http://localhost:3003/api"
```

**Required for Production (Vercel Dashboard):**
```bash
# Supabase Database
DATABASE_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://projects.myfundaction.org"
NEXTAUTH_SECRET="strong-production-secret-here"

# Cloudinary (file storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Resend
RESEND_API_KEY="re_production_key"

# Sentry
SENTRY_DSN="https://xxx@yyy.ingest.sentry.io/zzz"

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="production_key"

# Integration URLs (production)
BENEFICIARY_API_URL="https://beneficiary.myfundaction.org/api"
VOLUNTEER_API_URL="https://volunteers.myfundaction.org/api"
CRM_API_URL="https://crm.myfundaction.org/api"
```

### Database Migrations

**Local Development:**
```bash
# Create migration
npx prisma migrate dev --name add_project_model

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

**Production (Vercel):**
```bash
# Add to package.json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma migrate deploy && next build"
  }
}
```

**Or use Vercel Build Command:**
```bash
prisma migrate deploy && prisma generate && next build
```

### Performance Optimization

**Next.js Configuration:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // For file uploads
    },
  },
};

module.exports = nextConfig;
```

**ISR (Incremental Static Regeneration):**
```typescript
// app/projects/page.tsx
export const revalidate = 30; // Revalidate every 30 seconds

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany();
  // ...
}
```

**Edge Functions for Real-Time API:**
```typescript
// app/api/realtime/updates/route.ts
// Note: SSE works better on Node.js runtime, not Edge
export const runtime = 'nodejs';

export async function GET(request: Request) {
  // SSE implementation
}
```

**Image Optimization:**
```typescript
import Image from 'next/image';

<Image
  src={project.coverImage}
  alt={project.name}
  width={800}
  height={400}
  className="rounded-lg"
  priority={false} // Lazy load
/>
```

### Custom Domain Configuration

**Vercel Dashboard:**
1. Go to Project Settings → Domains
2. Add custom domain: `projects.myfundaction.org`
3. Configure DNS (CNAME or A record)
4. Automatic HTTPS via Let's Encrypt

**DNS Records (Cloudflare/Route53/etc.):**
```
Type: CNAME
Name: projects
Value: cname.vercel-dns.com
```

---

## 9. SECURITY & COMPLIANCE

### Data Encryption

**At Rest:**
- Vercel Postgres: Encrypted by default
- Supabase: AES-256 encryption
- Cloudinary: Encrypted storage

**In Transit:**
- HTTPS enforced (Vercel automatic)
- TLS 1.3 for database connections

**Sensitive Fields:**
```typescript
// Encrypt sensitive data if needed
import { encrypt, decrypt } from '@/lib/crypto';

// Most project data is not highly sensitive
// But budget information should be access-controlled
```

### Role-Based Access Control (RBAC)

**Middleware Protection:**
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      if (path.startsWith('/admin')) {
        return token?.role === 'SUPER_ADMIN' || token?.role === 'ADMIN';
      }

      if (path.startsWith('/projects/new')) {
        return ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER'].includes(token?.role);
      }

      if (path.startsWith('/projects/[id]/edit')) {
        // Check if user is project manager or admin
        return token?.role === 'SUPER_ADMIN' ||
               token?.role === 'ADMIN' ||
               token?.role === 'PROJECT_MANAGER';
      }

      return !!token; // Authenticated
    },
  },
});

export const config = {
  matcher: ['/projects/:path*', '/admin/:path*', '/api/:path*'],
};
```

**API Route Protection:**
```typescript
// app/api/projects/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!['ADMIN', 'PROJECT_MANAGER'].includes(session.user.role)) {
    return new Response('Forbidden', { status: 403 });
  }

  // Proceed with project creation
}
```

**Project-Level Access Control:**
```typescript
// lib/access-control.ts
export async function canUserAccessProject(userId: string, projectId: string) {
  const session = await getServerSession(authOptions);

  // Admins can access all projects
  if (['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return true;
  }

  // Check if user is assigned to project
  const assignment = await prisma.projectAssignment.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  return !!assignment;
}
```

### Audit Logging

**Track Critical Actions:**
```typescript
// lib/audit.ts
export async function logAudit(action: string, details: object) {
  await prisma.auditLog.create({
    data: {
      action,
      details,
      userId: session.user.id,
      ipAddress: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent'),
      timestamp: new Date(),
    },
  });
}

// Usage
await logAudit('PROJECT_CREATED', { projectId: newProject.id });
await logAudit('PROJECT_UPDATED', { projectId, changes: diff });
await logAudit('TASK_MOVED', { taskId, fromColumn, toColumn });
```

**Audit Log Model:**
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  action      String
  details     Json
  userId      String
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())

  @@index([userId])
  @@index([timestamp])
}
```

### File Upload Security

**Validation:**
```typescript
// lib/upload.ts
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', ...];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(file: File) {
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum 10MB.');
  }

  return true;
}
```

### Rate Limiting

**API Routes:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '10 s'), // 20 requests per 10 seconds
});

// Usage in API route
export async function POST(req: Request) {
  const identifier = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }

  // Proceed
}
```

### Public Dashboard Security

**Sanitize Public Data:**
```typescript
// lib/public-sanitizer.ts
export function sanitizeProjectForPublic(project: Project) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    percentComplete: project.percentComplete,
    startDate: project.startDate,
    endDate: project.endDate,
    coverImage: project.coverImage,
    category: project.category,
    // Exclude: budget, actualCost, internal notes, team emails
  };
}
```

---

## 10. TESTING APPROACH

### Unit Testing (Vitest)

**Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Example Tests:**
```typescript
// __tests__/lib/progress-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateProjectProgress } from '@/lib/progress-calculator';

describe('Project Progress Calculator', () => {
  it('should calculate project progress from tasks', () => {
    const tasks = [
      { status: 'DONE', percentComplete: 100 },
      { status: 'IN_PROGRESS', percentComplete: 50 },
      { status: 'TODO', percentComplete: 0 },
    ];

    const progress = calculateProjectProgress(tasks);
    expect(progress).toBe(50); // (100 + 50 + 0) / 3
  });

  it('should return 0 for project with no tasks', () => {
    const progress = calculateProjectProgress([]);
    expect(progress).toBe(0);
  });
});
```

**Component Tests:**
```typescript
// __tests__/components/KanbanBoard.test.tsx
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '@/components/KanbanBoard';

describe('KanbanBoard', () => {
  it('should render task columns', () => {
    const tasks = [
      { id: '1', title: 'Task 1', status: 'TODO' },
      { id: '2', title: 'Task 2', status: 'IN_PROGRESS' },
    ];

    render(<KanbanBoard tasks={tasks} />);

    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('DONE')).toBeInTheDocument();
  });
});
```

### Integration Testing

**API Route Tests:**
```typescript
// __tests__/api/projects.test.ts
import { POST } from '@/app/api/projects/route';

describe('POST /api/projects', () => {
  it('should create a project', async () => {
    const req = new Request('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Project',
        category: 'HOMELESS_CARE',
        status: 'PLANNING',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.name).toBe('Test Project');
  });
});
```

**SSE Tests:**
```typescript
// __tests__/api/realtime.test.ts
import { GET } from '@/app/api/realtime/updates/route';

describe('GET /api/realtime/updates', () => {
  it('should return SSE stream', async () => {
    const req = new Request('http://localhost:3000/api/realtime/updates');
    const response = await GET(req);

    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
  });
});
```

### E2E Testing with Playwright MCP

**Use the Playwright MCP server for E2E tests:**

```typescript
// tests/e2e/project-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Project Management Workflow', () => {
  test('complete project creation flow', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'manager@myfundaction.org');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to create project
    await page.goto('/projects/new');

    // Fill form
    await page.fill('[name="name"]', 'New Homeless Care Project');
    await page.fill('[name="description"]', 'Providing shelter services');
    await page.selectOption('[name="category"]', 'HOMELESS_CARE');
    await page.selectOption('[name="status"]', 'PLANNING');

    // Upload cover image
    await page.setInputFiles('[name="coverImage"]', 'tests/fixtures/project-cover.jpg');

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect to project page
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+/);
    await expect(page.locator('h1')).toContainText('New Homeless Care Project');
  });

  test('drag-and-drop task workflow', async ({ page }) => {
    await page.goto('/projects/test-project');

    // Wait for kanban board to load
    await page.waitForSelector('[data-column="todo"]');

    // Create new task
    await page.click('button:has-text("Add Task")');
    await page.fill('[name="taskTitle"]', 'Test Task');
    await page.click('button:has-text("Create")');

    // Wait for task to appear
    const task = page.locator('[data-task-title="Test Task"]');
    await expect(task).toBeVisible();

    // Drag task from TODO to IN_PROGRESS
    const inProgressColumn = page.locator('[data-column="in-progress"]');
    await task.dragTo(inProgressColumn);

    // Verify task moved
    await expect(inProgressColumn.locator('[data-task-title="Test Task"]')).toBeVisible();
  });

  test('real-time update propagation', async ({ browser }) => {
    // Open two browser contexts to simulate two users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both users navigate to same project
    await page1.goto('/projects/test-project');
    await page2.goto('/projects/test-project');

    // User 1 moves a task
    const task = page1.locator('[data-task-title="Test Task"]');
    const doneColumn = page1.locator('[data-column="done"]');
    await task.dragTo(doneColumn);

    // Wait for SSE update to propagate to User 2
    await page2.waitForTimeout(2000);

    // Verify User 2 sees the update
    await expect(page2.locator('[data-column="done"] [data-task-title="Test Task"]')).toBeVisible();

    await context1.close();
    await context2.close();
  });
});
```

**Run E2E tests with Playwright MCP:**
- Use the `mcp__playwright__browser_*` tools
- Capture screenshots at key points
- Test critical user journeys

### Load Testing

**Considerations:**
- 20-30 active projects
- 180 staff + project managers (potential concurrent users)
- Real-time updates to multiple connected clients
- Test with k6 or Artillery

**Example Load Test (k6):**
```javascript
// tests/load/projects.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function () {
  const res = http.get('https://projects.myfundaction.org/api/projects');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });
}
```

---

## 11. MALAYSIAN CONTEXT

### i18n Setup (Bahasa Malaysia + English)

**Install next-intl:**
```bash
npm install next-intl
```

**Configuration:**
```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

**Messages:**
```json
// messages/en.json
{
  "project": {
    "title": "Projects",
    "create": "Create Project",
    "name": "Project Name",
    "description": "Description",
    "status": "Status",
    "progress": "Progress",
    "statuses": {
      "planning": "Planning",
      "in_progress": "In Progress",
      "on_hold": "On Hold",
      "completed": "Completed"
    },
    "categories": {
      "homeless_care": "Homeless Care",
      "food_distribution": "Food Distribution",
      "shelter_services": "Shelter Services"
    }
  },
  "task": {
    "title": "Tasks",
    "create": "Create Task",
    "assign": "Assign Task",
    "due_date": "Due Date"
  }
}

// messages/ms.json
{
  "project": {
    "title": "Projek",
    "create": "Cipta Projek",
    "name": "Nama Projek",
    "description": "Keterangan",
    "status": "Status",
    "progress": "Kemajuan",
    "statuses": {
      "planning": "Perancangan",
      "in_progress": "Dalam Kemajuan",
      "on_hold": "Ditangguh",
      "completed": "Selesai"
    },
    "categories": {
      "homeless_care": "Jagaan Gelandangan",
      "food_distribution": "Agihan Makanan",
      "shelter_services": "Perkhidmatan Perlindungan"
    }
  },
  "task": {
    "title": "Tugasan",
    "create": "Cipta Tugasan",
    "assign": "Tugaskan",
    "due_date": "Tarikh Akhir"
  }
}
```

**Usage:**
```typescript
import { useTranslations } from 'next-intl';

export default function ProjectsPage() {
  const t = useTranslations('project');

  return <h1>{t('title')}</h1>;
}
```

### Malaysian Phone Number Format

**Validation:**
```typescript
// lib/validation.ts
import { z } from 'zod';

export const malaysianPhoneSchema = z
  .string()
  .regex(/^\+60\d{9,10}$/, 'Invalid Malaysian phone number. Format: +60123456789');

// Example usage
const userSchema = z.object({
  phone: malaysianPhoneSchema.optional(),
});
```

**Formatting:**
```typescript
// lib/format.ts
export function formatMalaysianPhone(phone: string): string {
  // +60123456789 → +60 12-345 6789
  return phone.replace(/(\+60)(\d{2})(\d{3})(\d{4})/, '$1 $2-$3 $4');
}
```

### Islamic Calendar Integration

**For Ramadan/Qurban project timing:**
```bash
npm install moment-hijri
```

**Example:**
```typescript
import moment from 'moment-hijri';

// Display Islamic date on project timeline
const islamicDate = moment().format('iYYYY/iM/iD');
// e.g., "1446/9/15" (Ramadan 15, 1446)

// Check if project is during Ramadan
export function isDuringRamadan(date: Date): boolean {
  const hijriMonth = moment(date).iMonth(); // 0-indexed
  return hijriMonth === 8; // Ramadan is 9th month (0-indexed = 8)
}
```

### WhatsApp Notifications

**Deep Links:**
```typescript
// lib/whatsapp.ts
export function notifyTaskAssignment(task: Task, assignee: User) {
  const message = `You have been assigned to task: "${task.title}"\nDue: ${task.dueDate}\nProject: ${task.project.name}`;
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${assignee.phone.replace(/\+/g, '')}?text=${encoded}`;

  return url;
}

// Usage: Send notification via WhatsApp
const whatsappUrl = notifyTaskAssignment(task, user);
// Admin can click to send message via WhatsApp Web
```

**WhatsApp Share Button:**
```tsx
// components/WhatsAppShareButton.tsx
export function WhatsAppShareButton({ projectId }: { projectId: string }) {
  const shareProject = () => {
    const url = `https://projects.myfundaction.org/public/${projectId}`;
    const message = `Check out this MyFundAction project: ${url}`;
    const encoded = encodeURIComponent(message);

    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <button onClick={shareProject} className="btn-whatsapp">
      Share on WhatsApp
    </button>
  );
}
```

---

## 12. MONITORING & ANALYTICS

### Vercel Analytics

**Install:**
```bash
npm install @vercel/analytics
```

**Setup:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Track Custom Events:**
```typescript
import { track } from '@vercel/analytics';

// Track project creation
track('project_created', {
  category: project.category,
  status: project.status,
});

// Track task moved
track('task_moved', {
  fromColumn: task.columnId,
  toColumn: newColumnId,
  projectId: task.projectId,
});

// Track real-time connection
track('sse_connected', {
  projectId: currentProject.id,
});
```

### Sentry Error Tracking

**Install:**
```bash
npm install @sentry/nextjs
```

**Setup:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

**Custom Error Logging:**
```typescript
try {
  await updateTaskPosition(taskId, newPosition);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'drag_drop' },
    user: { id: session.user.id },
    extra: { taskId, newPosition },
  });
  throw error;
}
```

### Posthog User Behavior Analytics

**Install:**
```bash
npm install posthog-js
```

**Setup:**
```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

export { posthog };
```

**Track Events:**
```typescript
import { posthog } from '@/lib/posthog';

// Track feature usage
posthog.capture('project_created', {
  category: project.category,
  user_role: session.user.role,
});

posthog.capture('task_dragged', {
  from_column: fromColumn,
  to_column: toColumn,
});

// Identify user
posthog.identify(session.user.id, {
  email: session.user.email,
  role: session.user.role,
  organization: session.user.organization,
});
```

### Custom Dashboards for NGO Metrics

**Key Metrics to Track:**
- Projects created per month
- Tasks completed per project
- Average project completion time
- Team member workload
- Real-time active users
- Public dashboard views
- Milestone completion rate

**Implementation:**
```typescript
// app/api/metrics/route.ts
export async function GET(req: Request) {
  const [
    totalProjects,
    activeProjects,
    completedTasksThisMonth,
    overdueTasksCount,
    avgCompletionTime,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({
      where: {
        status: 'DONE',
        completedAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),
    prisma.task.count({
      where: {
        status: { not: 'DONE' },
        dueDate: { lt: new Date() },
      },
    }),
    calculateAverageCompletionTime(),
  ]);

  return Response.json({
    totalProjects,
    activeProjects,
    completedTasksThisMonth,
    overdueTasksCount,
    avgCompletionTime,
  });
}
```

**Real-Time Metrics:**
```typescript
// Track SSE connections
let activeConnections = 0;

export async function GET(request: Request) {
  activeConnections++;

  // Track connection duration
  const startTime = Date.now();

  request.signal.addEventListener('abort', () => {
    activeConnections--;
    const duration = Date.now() - startTime;

    // Log to analytics
    posthog.capture('sse_disconnected', {
      duration,
      activeConnections,
    });
  });

  // SSE implementation...
}
```

### Uptime Monitoring

**Use UptimeRobot or Better Uptime:**
- Monitor `https://projects.myfundaction.org/api/health`
- Alert via Email, SMS, Slack if downtime

**Health Check Endpoint:**
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check if SSE is functioning
    const sseHealth = await checkSSEHealth();

    return Response.json({
      status: 'healthy',
      database: 'connected',
      sse: sseHealth ? 'operational' : 'degraded',
    }, { status: 200 });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message,
    }, { status: 500 });
  }
}
```

**SSE Connection Monitoring:**
```typescript
// lib/sse-monitor.ts
export class SSEMonitor {
  private connections = new Map<string, Date>();

  addConnection(userId: string) {
    this.connections.set(userId, new Date());
  }

  removeConnection(userId: string) {
    this.connections.delete(userId);
  }

  getActiveConnections() {
    return this.connections.size;
  }

  getConnectionDuration(userId: string) {
    const startTime = this.connections.get(userId);
    if (!startTime) return 0;
    return Date.now() - startTime.getTime();
  }
}

export const sseMonitor = new SSEMonitor();
```

---

## REAL-TIME IMPLEMENTATION DETAILS

### Server-Sent Events (SSE) Setup

**Why SSE over WebSockets?**
- Simpler implementation for one-way server-to-client updates
- Automatic reconnection built-in
- Works over HTTP/HTTPS (no special protocol)
- Better compatibility with proxies and load balancers
- Sufficient for project tracking use case (no need for bidirectional communication)

**SSE API Route:**
```typescript
// app/api/realtime/updates/route.ts
import { getServerSession } from 'next-auth';

export const runtime = 'nodejs'; // SSE requires Node.js runtime

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      connections.set(session.user.id, controller);

      // Send initial connection message
      const data = JSON.stringify({ type: 'connected', timestamp: Date.now() });
      controller.enqueue(`data: ${data}\n\n`);

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`: heartbeat\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          connections.delete(session.user.id);
        }
      }, 30000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        connections.delete(session.user.id);
        try {
          controller.close();
        } catch (error) {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Broadcast update to all connected clients
export function broadcastUpdate(event: string, data: any) {
  const message = JSON.stringify({ type: event, data, timestamp: Date.now() });

  connections.forEach((controller) => {
    try {
      controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      // Connection closed, will be cleaned up
    }
  });
}
```

**Client-Side SSE Hook:**
```typescript
// hooks/useRealtimeUpdates.ts
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeUpdates(projectId?: string) {
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource('/api/realtime/updates');

    eventSource.onopen = () => {
      setConnected(true);
      console.log('SSE connected');
    };

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);

      switch (update.type) {
        case 'project_updated':
          if (!projectId || update.data.projectId === projectId) {
            queryClient.invalidateQueries({ queryKey: ['project', update.data.projectId] });
          }
          break;

        case 'task_updated':
        case 'task_moved':
          if (!projectId || update.data.projectId === projectId) {
            queryClient.invalidateQueries({ queryKey: ['tasks', update.data.projectId] });
          }
          break;

        case 'comment_added':
          queryClient.invalidateQueries({ queryKey: ['comments', update.data.taskId] });
          break;
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      console.error('SSE error, reconnecting...');
      // Browser will automatically reconnect
    };

    return () => {
      eventSource.close();
    };
  }, [projectId, queryClient]);

  return { connected };
}
```

**Triggering Updates:**
```typescript
// app/api/tasks/[id]/route.ts
import { broadcastUpdate } from '@/app/api/realtime/updates/route';

export async function PATCH(req: Request, { params }) {
  const data = await req.json();

  const task = await prisma.task.update({
    where: { id: params.id },
    data,
    include: { project: true },
  });

  // Broadcast real-time update
  broadcastUpdate('task_updated', {
    taskId: task.id,
    projectId: task.projectId,
    changes: data,
  });

  return Response.json(task);
}
```

---

## DRAG-AND-DROP IMPLEMENTATION

### dnd-kit Setup

**Install:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Kanban Board Component:**
```typescript
// components/KanbanBoard.tsx
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';

export function KanbanBoard({ initialTasks, projectId }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState(null);

  const columns = {
    todo: tasks.filter(t => t.columnId === 'todo'),
    'in-progress': tasks.filter(t => t.columnId === 'in-progress'),
    done: tasks.filter(t => t.columnId === 'done'),
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumn = over.data?.current?.columnId || over.id;

    if (activeTask && activeTask.columnId !== overColumn) {
      setTasks(tasks.map(t =>
        t.id === active.id ? { ...t, columnId: overColumn } : t
      ));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumn = over.data?.current?.columnId || over.id;

    // Update position in database
    await fetch(`/api/tasks/${active.id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columnId: overColumn,
        position: over.data?.current?.position || 0,
      }),
    });

    setActiveId(null);
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        {Object.entries(columns).map(([columnId, columnTasks]) => (
          <KanbanColumn
            key={columnId}
            id={columnId}
            title={columnId.toUpperCase()}
            tasks={columnTasks}
          />
        ))}
      </div>
    </DndContext>
  );
}
```

**Sortable Task Card:**
```typescript
// components/TaskCard.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded shadow cursor-move"
      data-task-id={task.id}
      data-task-title={task.title}
    >
      <h3 className="font-semibold">{task.title}</h3>
      <p className="text-sm text-gray-600">{task.description}</p>
      {task.assignedTo && (
        <div className="mt-2 text-xs text-gray-500">
          Assigned to: {task.assignedTo.name}
        </div>
      )}
    </div>
  );
}
```

---

## FINAL INSTRUCTIONS

### Development Checklist

- [ ] Clone TailAdmin Next.js template or start fresh with `npx create-next-app@latest`
- [ ] Set up Prisma with the suggested schema
- [ ] Implement NextAuth with RBAC
- [ ] Create project CRUD operations
- [ ] Build kanban board with dnd-kit
- [ ] Implement task management (create, edit, assign, move)
- [ ] Add milestone tracking
- [ ] Set up Server-Sent Events for real-time updates
- [ ] Create public dashboard views
- [ ] Implement progress visualization (charts)
- [ ] Add project updates/feed feature
- [ ] Set up file uploads (images, attachments)
- [ ] Create reporting endpoints
- [ ] Integrate with beneficiary and volunteer systems
- [ ] Write unit tests for critical functions
- [ ] Write E2E tests with Playwright MCP (especially drag-and-drop)
- [ ] Set up i18n (English + Bahasa Malaysia)
- [ ] Deploy to Vercel
- [ ] Configure production database (Supabase)
- [ ] Set up monitoring (Sentry, Posthog, Vercel Analytics)
- [ ] Test real-time updates with multiple clients

### Remember:

1. **Commit frequently** - at least 3-5 times per hour
2. **Use TodoWrite** to track your progress
3. **Use MCP tools**:
   - sequential-thinking for complex decisions
   - filesystem for multi-file operations
   - fetch/deepwiki for research (especially Worklenz)
   - allpepper-memory-bank to document decisions
   - playwright for E2E testing
4. **Mobile-first design** - field teams need mobile access
5. **Real-time is critical** - SSE must work reliably
6. **Public dashboard** - sanitize data, focus on impact
7. **Test thoroughly** - drag-and-drop and real-time features are complex

Good luck building! 🚀
