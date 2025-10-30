# MyFundAction Projects Dashboard

Live project tracking dashboard for MyFundAction NGO with real-time updates.

## Overview

This is a Next.js 15 application built for MyFundAction (Yayasan Kebajikan Muslim), a youth-driven Malaysian NGO. The dashboard provides real-time project tracking, kanban boards, milestone management, and public-facing project views for stakeholders.

### Key Features

- **Real-time Updates**: Server-Sent Events (SSE) for live project and task updates
- **Project Management**: Create, edit, and track 20-30 simultaneous projects
- **Kanban Board**: Drag-and-drop task management with dnd-kit
- **Milestone Tracking**: Track project milestones and deadlines
- **Public Dashboard**: Stakeholder-friendly views showing project progress and impact
- **Team Management**: Assign tasks, track workload, and manage team members
- **Progress Visualization**: Interactive charts with Recharts
- **Mobile-First**: Responsive design for field teams

## Tech Stack

### Frontend
- **Next.js 15** (App Router) with React 19
- **TypeScript** (strict mode)
- **Ant Design** - Primary UI framework
- **Tailwind CSS** - Utility styling
- **dnd-kit** - Drag-and-drop for kanban boards
- **Recharts** - Data visualization
- **React Hook Form + Zod** - Form validation

### Backend
- **Next.js API Routes** (serverless)
- **Prisma ORM** - Database management
- **PostgreSQL** - Database (Vercel Postgres for dev, Supabase for production)
- **Server-Sent Events (SSE)** - Real-time updates

### Authentication
- **NextAuth v5** (Auth.js)
- Role-based access control (RBAC)
- Roles: Super Admin, Admin, Project Manager, Team Member, Stakeholder

### State Management
- **Zustand** - Global UI state
- **React Query (@tanstack/react-query)** - Server state management

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd projs-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database connection strings
- NextAuth secret and URL
- File storage credentials (optional)
- Email service credentials (optional)

4. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:seed
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
projs-dashboard/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   └── realtime/      # SSE endpoints
│   ├── dashboard/         # Dashboard page
│   ├── projects/          # Projects list
│   ├── kanban/            # Kanban board
│   ├── public-view/       # Public stakeholder view
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── projects/         # Project-related components
│   ├── tasks/            # Task components
│   └── kanban/           # Kanban board components
├── lib/                   # Utilities and helpers
│   ├── db/               # Database utilities
│   ├── auth/             # Authentication utilities
│   ├── utils/            # General utilities
│   └── validation/       # Zod schemas
├── hooks/                 # Custom React hooks
│   └── useRealtimeUpdates.ts  # SSE client hook
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Database Schema

The Prisma schema includes:

- **Project**: Main project entity with status, progress, dates, and metadata
- **Task**: Individual tasks with drag-and-drop positioning
- **Milestone**: Project milestones with due dates
- **ProjectUpdate**: Updates and announcements
- **User**: Team members with role-based access
- **ProjectAssignment**: Team member assignments
- **TaskComment**: Task comments and discussions
- **TaskAttachment**: File attachments for tasks
- **ProjectBeneficiary**: Links to beneficiary system
- **ProjectVolunteer**: Links to volunteer system

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:deploy` - Deploy migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data

## Real-Time Updates

The application uses Server-Sent Events (SSE) for real-time updates:

### Server Side
The SSE endpoint is located at `/app/api/realtime/updates/route.ts`. It broadcasts updates to all connected clients when:
- Projects are created/updated
- Tasks are moved or updated
- Comments are added
- Milestones are completed

### Client Side
Use the `useRealtimeUpdates` hook to subscribe to real-time updates:

```typescript
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

function MyComponent() {
  const { connected, lastUpdate } = useRealtimeUpdates({
    projectId: 'optional-project-id',
    onUpdate: (update) => {
      console.log('Received update:', update)
      // Handle the update
    }
  })

  return (
    <div>
      {connected ? 'Connected' : 'Disconnected'}
    </div>
  )
}
```

## Authentication

NextAuth v5 is configured for authentication with role-based access control:

- **Super Admin**: Full system access, user management
- **Admin**: Manage all projects, assign project managers
- **Project Manager**: Create/edit assigned projects, manage tasks
- **Team Member**: View assigned projects, update task status
- **Stakeholder**: Read-only access to public projects

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

The build command automatically runs Prisma migrations:
```bash
prisma generate && next build
```

### Database

- **Development**: Vercel Postgres
- **Production**: Supabase PostgreSQL (cost-effective at scale)

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
- `CLOUDINARY_*` - Cloudinary credentials (production)
- `RESEND_API_KEY` - Email service API key
- Additional optional variables for analytics and monitoring

## Contributing

This project is part of the MyFundAction ecosystem. For contributing guidelines, please refer to the main repository documentation.

## License

Copyright 2024 MyFundAction (Yayasan Kebajikan Muslim). All rights reserved.

## Support

For support and questions, please contact the MyFundAction development team.

---

Built with Next.js 15, React 19, and Ant Design by the MyFundAction development team.
