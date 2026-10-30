# Family Tree Copilot

A genealogy management platform built with Angular on the frontend and Express + MongoDB on the backend. The application supports a single admin with full management controls and read-only public family exploration.

## Architecture

Angular
  ↓
Express REST API
  ↓
Services
  ↓
Mongoose
  ↓
MongoDB

## Project structure

- `backend/` — Express API, MongoDB models, auth, seed data, configuration
- `frontend/` — Angular app for admin and public-family browsing
- `FAMILY_TREE_COPILOT_PROMPT.md` — product and technical specification

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Frontend setup

```bash
cd frontend
npm install --legacy-peer-deps
npm run start
```

## Default admin credential

Created automatically by the app startup seed process if no admin exists:

- Email: `admin@example.com`
- Password: `admin1234`

Change these values in your `.env` file before production use.

## API health

```bash
curl http://localhost:3000/api/health
```

## Seed data

The app bootstraps a default admin user and example families during startup if the database is empty.

## Notes

- The backend uses MongoDB with a local in-memory Mongo fallback for development when no external Mongo connection is configured.
- Admin routes require authentication and are protected server-side.
- Public routes expose only public family data.
