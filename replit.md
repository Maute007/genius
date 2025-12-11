# Genius - Educational AI Platform

## Overview
Genius is an educational AI platform for Mozambican students, featuring a REST API backend with Express/Sequelize and a React frontend with Vite.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript + Sequelize ORM
- **Database**: PostgreSQL (Replit built-in)
- **Authentication**: API Key via X-API-Key header

## Project Structure
```
src/                  # Backend API
  config/             # Database configuration
  middlewares/        # Authentication and error handling
  models/             # Sequelize models (Conversation, Message, Profile)
  routes/             # Express routers for each resource
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

#### Conversations
- `GET /conversations` - List all conversations
- `GET /conversations/:id` - Get conversation by ID
- `POST /conversations` - Create conversation
  - Body: `{ "title": string, "mode": "quick_doubt"|"exam_prep"|"revision"|"free_learning" }`
- `PUT /conversations/:id` - Update conversation
- `DELETE /conversations/:id` - Delete conversation

#### Messages
- `GET /conversations/:conversationId/messages` - List messages
- `POST /conversations/:conversationId/messages` - Create message
  - Body: `{ "content": string, "role": "user"|"assistant" }`
- `PUT /conversations/:conversationId/messages/:messageId` - Update message
- `DELETE /conversations/:conversationId/messages/:messageId` - Delete message

#### Profiles
- `GET /profiles/:userId` - Get profile (auto-creates if not exists)
- `PUT /profiles/:userId` - Update profile

### Health Check
`GET /health` - Returns server status (no auth required)

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (provided by Replit)
- `API_KEY` - API key for authentication (default: genius-api-key-2024)
- `API_PORT` - Backend API port (default: 3001)
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
- `/chat` - Main chat interface (protected)
- `/dashboard` - User dashboard (protected)
