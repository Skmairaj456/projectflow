# ProjectFlow - Enterprise Project Management SaaS

A modern, full-stack project management platform built with Next.js 14, TypeScript, Prisma, and PostgreSQL. Features real-time collaboration, task management, team workspaces, and comprehensive analytics.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can work on projects simultaneously with live updates
- **Advanced Task Management**: Kanban boards, task assignments, priorities, due dates, and labels
- **Team Workspaces**: Create workspaces with role-based access control (Owner, Admin, Member, Viewer)
- **File Attachments**: Upload and manage files for tasks
- **Comments & Activity**: Track all project activity with comments and activity logs
- **Analytics Dashboard**: Visualize project progress with charts and insights
- **Dark Mode**: Beautiful dark theme support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Beautiful DnD** - Drag and drop
- **Socket.io Client** - Real-time updates
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma** - ORM and database management
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **NextAuth.js** - Authentication
- **Socket.io** - WebSocket server

### Infrastructure
- **Vercel** - Frontend deployment
- **Railway/Render** - Backend and database
- **Cloudinary** - File storage
- **GitHub Actions** - CI/CD

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Redis (optional, for caching)
- Cloudinary account (for file uploads)

## 🚀 Getting Started

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd project-management-saas
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
npm run db:generate
npm run db:migrate
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## 📁 Project Structure

```
project-management-saas/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── features/         # Feature-specific components
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
└── public/               # Static assets
```

## 🔐 Authentication

The app uses NextAuth.js for authentication with support for:
- Email/Password authentication
- OAuth providers (Google, GitHub) - optional

## 📊 Database Schema

Key models:
- **User** - User accounts
- **Workspace** - Team workspaces
- **WorkspaceMember** - Workspace membership with roles
- **Project** - Projects within workspaces
- **Task** - Tasks with status, priority, assignee
- **Column** - Kanban board columns
- **Comment** - Task comments
- **Activity** - Activity log
- **TaskAttachment** - File attachments

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

## 🚢 Deployment

### Environment Variables

For production, ensure the following environment variables are set:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key" # Generate with: openssl rand -base64 32
NEXTAUTH_URL="https://your-domain.com"
```

### Deployment Steps (Vercel)

1. **Database**: Set up a PostgreSQL database (e.g., on Railway, Supabase, or Neon).
2. **Migrations**: Ensure you run `npx prisma migrate deploy` in your CI/CD or build step.
3. **Environment**: Add all required variables in the Vercel project settings.
4. **Deploy**: Push to GitHub and Vercel will handle the rest.

### Recommended CI/CD Script
```bash
# Build command in Vercel
npx prisma generate && npx prisma migrate deploy && next build
```

## 📝 API Documentation

API endpoints are documented using OpenAPI/Swagger. Access the docs at `/api/docs` when running locally.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

Your Name - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

