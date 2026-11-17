# Backend (Next.js API routes)

This folder holds the backend: API route handlers, Prisma schema, and server-side logic.

- Port: 4000 (run with `npm run dev` from this folder)
- API base: http://localhost:4000/api

Structure:
- app/api/       -> route handlers
- lib/            -> server utilities
- prisma/         -> schema & migrations
- data/           -> seed data

Migration note: scaffold only. Move files from root `/app/api`, `/lib`, `/prisma`, `/data` here when ready.