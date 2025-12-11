# Genius - AI Learning Platform for Mozambique

## Overview
Genius is an AI-powered educational platform designed specifically for the Mozambican context. It provides personalized learning assistance, exam preparation, and revision tools for students.

## Tech Stack
- **Frontend**: React 19 with Vite 7, TailwindCSS 4
- **Backend**: Express + tRPC
- **Database**: PostgreSQL with Drizzle ORM
- **Language**: TypeScript

## Project Structure
```
client/           # Frontend React application
  src/
    components/   # UI components (shadcn/ui based)
    pages/        # Page components
    hooks/        # Custom React hooks
    lib/          # Utilities (trpc client, utils)
    contexts/     # React contexts
server/           # Backend Express server
  _core/          # Core server utilities
  routers.ts      # tRPC routers
  db.ts           # Database operations
shared/           # Shared types and constants
drizzle/          # Database schema and migrations
```

## Running the Application
- Development: `npm run dev` - Runs on port 5000
- Build: `npm run build`
- Production: `npm run start`

## Database
The project uses PostgreSQL (Replit's built-in database).
- Schema is defined in `drizzle/schema.ts`
- Migrations: `npm run db:push`

## Key Features
- User authentication (email/password with verification)
- Student profiles with personalization
- AI-powered chat for learning assistance
- Exam preparation mode
- Revision/review system
- Learning progress tracking
- Subscription plans (free, student, student_plus, family)
- Admin panel for user management

## Environment Variables
The application uses environment variables for configuration:
- `DATABASE_URL` - PostgreSQL connection string (provided by Replit)
- `JWT_SECRET` / `SESSION_SECRET` - For session management
- `CLAUDE_API_KEY` - For AI chat functionality
- `OAUTH_SERVER_URL` - For OAuth integration (optional)

## Notes
- The application was originally built for MySQL and has been converted to PostgreSQL for Replit compatibility
- All hosts are allowed in Vite config for Replit proxy compatibility
- Server binds to 0.0.0.0:5000 for accessibility
