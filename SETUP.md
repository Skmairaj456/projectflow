# Setup Guide

Follow these steps to get the ProjectFlow application running locally.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in the required values:

### Required Variables

- `DATABASE_URL`: Your PostgreSQL connection string
  - Format: `postgresql://username:password@localhost:5432/database_name?schema=public`
  - For local PostgreSQL: `postgresql://postgres:password@localhost:5432/project_management?schema=public`

- `NEXTAUTH_URL`: Your application URL
  - For local development: `http://localhost:3000`
  - For production: Your production URL

- `NEXTAUTH_SECRET`: A random secret key
  - Generate one with: `openssl rand -base64 32`
  - Or use an online generator

### Optional Variables (for full functionality)

- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google OAuth
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: For GitHub OAuth
- `REDIS_URL`: For caching (optional)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For file uploads
- `RESEND_API_KEY`: For email notifications

## Step 3: Set Up Database

1. Make sure PostgreSQL is running

2. Generate Prisma Client:
```bash
npm run db:generate
```

3. Run database migrations:
```bash
npm run db:migrate
```

This will create all the necessary tables in your database.

4. (Optional) Open Prisma Studio to view your database:
```bash
npm run db:studio
```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Create Your First Account

1. Navigate to the sign-up page
2. Create an account with email and password
3. Sign in and start creating workspaces and projects!

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check your `DATABASE_URL` is correct
- Verify database credentials

### Port Already in Use

If port 3000 is already in use:
- Change the port in `package.json`: `"dev": "next dev -p 3001"`
- Or kill the process using port 3000

### Prisma Issues

- Run `npm run db:generate` again
- Check your `DATABASE_URL` format
- Ensure migrations are up to date: `npm run db:migrate`

## Next Steps

- Set up OAuth providers (Google, GitHub) for social login
- Configure Cloudinary for file uploads
- Set up Redis for caching (optional)
- Configure email service for notifications

## Production Deployment

See the main README.md for deployment instructions to Vercel and Railway.


