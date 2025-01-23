# Learning Management System

## Prerequisites
- Node.js 16+
- PostgreSQL
- Vercel account

## Local Development Setup
1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Install dependencies: `npm install`
4. Generate Prisma client: `npx prisma generate`
5. Run migrations: `npx prisma migrate dev`
6. Seed the database: `npm run prisma:seed`
7. Start the development server: `npm run dev`

## Deployment to Vercel
1. Push your code to GitHub
2. Create a new project in Vercel
3. Connect your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy

## Environment Variables
- `POSTGRES_PRISMA_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random string for session encryption
- `NEXTAUTH_URL`: Your application URL
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token

## Features
- User Authentication & Management
- Course Management with SCORM Support
- Learning Paths
- Progress Tracking
- Real-time Notifications
- Analytics Dashboard
- Certificate Generation
