# Genius - Educational AI Platform

## Overview
Genius is an educational AI platform for Mozambican students, featuring a REST API backend with Express/Sequelize and a React frontend with Vite. The platform uses Claude AI (via Anthropic API) for intelligent tutoring.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript + Sequelize ORM
- **Database**: PostgreSQL (Replit built-in)
- **AI**: Anthropic Claude API for chat responses
- **Authentication**: Simple API Key auth + localStorage for user sessions

## Project Structure
```
src/                  # Backend API
  config/             # Database configuration
  middlewares/        # Authentication and error handling
  models/             # Sequelize models (Conversation, Message, Profile)
  routes/             # Express routers for each resource
    chat.ts           # Claude AI integration endpoint
    conversations.ts  # Conversation CRUD
    messages.ts       # Message CRUD
    profiles.ts       # User profiles
  types/              # TypeScript type definitions
  utils/              # Response helper utilities
  index.ts            # Main server entry point

client/               # Frontend React app
  src/
    _core/            # Core hooks (auth)
    components/       # UI components
    contexts/         # React contexts
    hooks/            # Custom hooks
    lib/              # API client and utilities
    pages/            # Page components
```

## Running the Application
- Development: `npm run dev` - Runs both frontend (Vite on port 5000) and backend (API on port 3001)
- Build: `npm run build`
- Production: `npm run start`

## API Documentation

### Base URL
`/api/v1`

### Authentication
All API endpoints require the `X-API-Key` header:
```
X-API-Key: genius-api-key-2024
```

### Response Format
Success: `{ "success": true, "data": ... }`
Error: `{ "success": false, "error": "..." }`

### Endpoints

#### Chat (AI)
- `POST /chat` - Send message to Claude AI
  - Body: `{ "message": string, "mode": string, "history": array }`
  - Modes: `quick_doubt`, `exam_prep`, `revision`, `free_learning`

#### Conversations
- `GET /conversations` - List all conversations
- `GET /conversations/:id` - Get conversation by ID
- `POST /conversations` - Create conversation
- `PUT /conversations/:id` - Update conversation
- `DELETE /conversations/:id` - Delete conversation

#### Messages
- `GET /conversations/:conversationId/messages` - List messages
- `POST /conversations/:conversationId/messages` - Create message
- `PUT /conversations/:conversationId/messages/:messageId` - Update message
- `DELETE /conversations/:conversationId/messages/:messageId` - Delete message

#### Profiles
- `GET /profiles/:userId` - Get profile
- `PUT /profiles/:userId` - Update profile

### Health Check
`GET /health` - Returns server status (no auth required)

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude
- `CLAUDE_MODEL` - Claude model to use
- `API_KEY` - API key for authentication
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Application logo path

## Frontend Pages
- `/` - Home page (landing)
- `/planos` - Pricing plans
- `/escolas` - For schools
- `/sobre` - About us
- `/contactos` - Contact
- `/login` - Login page
- `/register` - Registration
- `/chat` - Main chat interface with AI tutor
- `/dashboard` - User dashboard
- `/revision` - Smart revision feature
- `/onboarding` - User onboarding

## Design
- Theme: Black/white with teal (#14b8a6) accent color
- Font: Playfair Display + Inter
- Responsive design for mobile and desktop
