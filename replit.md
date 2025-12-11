# Genius - REST API Backend

## Overview
Genius REST API backend built with Express, TypeScript, and Sequelize ORM. Provides CRUD operations for conversations, messages, and profiles.

## Tech Stack
- **Backend**: Express.js with TypeScript
- **ORM**: Sequelize
- **Database**: PostgreSQL (Replit built-in)
- **Authentication**: API Key via X-API-Key header

## Project Structure
```
src/
  config/         # Database configuration
  middlewares/    # Authentication and error handling
  models/         # Sequelize models (Conversation, Message, Profile)
  routes/         # Express routers for each resource
  types/          # TypeScript type definitions
  utils/          # Response helper utilities
  index.ts        # Main server entry point
```

## Running the Application
- Development: `npm run dev` - Runs on port 5000
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
  - Body: `{ "title"?: string, "mode"?: string }`
- `DELETE /conversations/:id` - Delete conversation (cascade deletes messages)

#### Messages
- `GET /conversations/:conversationId/messages` - List messages in conversation
- `POST /conversations/:conversationId/messages` - Create message
  - Body: `{ "content": string, "role": "user"|"assistant" }`
- `PUT /conversations/:conversationId/messages/:messageId` - Update message
  - Body: `{ "content": string }`
- `DELETE /conversations/:conversationId/messages/:messageId` - Delete message

#### Profiles
- `GET /profiles/:userId` - Get profile (auto-creates if not exists)
- `PUT /profiles/:userId` - Update profile
  - Body: `{ "name"?: string, "email"?: string }`

### Health Check
`GET /health` - Returns server status (no auth required)

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (provided by Replit)
- `API_KEY` - API key for authentication (default: genius-api-key-2024)
- `PORT` - Server port (default: 5000)

## Model Fields

### Conversation
- id, title, mode, subject, topic, isActive, createdAt, updatedAt

### Message
- id, conversationId, content, role, tokens, createdAt, updatedAt

### Profile
- id, userId, name, email, createdAt, updatedAt
