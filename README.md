# team1-back-app 
Team 1 Backend Application Feb/March 2026

## Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```

Server runs on http://localhost:${PORT} (default is http://localhost:3001 when `PORT` is not set or is 3001 in `.env`)
Health check: http://localhost:${PORT}/health (for the default port this is http://localhost:3001/health)



## Database Setup (PostgreSQL + Prisma)

1. **Create the database**
```bash
createdb kainos-jobs
```

2. **Configure the `DATABASE_URL`**
Update `.env` with your connection string:
```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/kainos-jobs?schema=public"
```

3. **Run the initial migration**
```bash
npx prisma migrate dev --name init
```

### Testing

Tests are located in the `/test/` directory and mirror the `/src/` structure:
- Unit tests use Jest + Supertest
- Run `npm test` for single test run
- Run `npm run test:watch` for development
- Coverage reports generated in `/coverage/`