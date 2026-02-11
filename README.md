# team1-back-app 
Team 1 Backend Application Feb/March 2026

## Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```

Health check: http://localhost:${PORT}/health (for the default port this is http://localhost:3001/health)
Uses Express and PostgreSQL + Prisma

## Linting

This project uses **Biome** for fast, comprehensive code linting and formatting.
- Configuration file: `biome.json`
- Lints TypeScript files in the `/src/` directory
- Follows recommended rules with consistent formatting
- Integrates with CI/CD pipeline

### Available Commands
```bash
npm run check        # Check for linting issues
npm run check:fix    # Automatically fix linting issues
```

## Testing

Tests are located in the `/test/` directory and mirror the `/src/` structure:
- Unit tests use Vitest + Supertest
- Run `npm test` for single test run
- Run `npm run test:coverage` for coverage report with 80% thresholds
- Coverage reports generated in `/coverage/`

## Database Setup Steps

1. **Verify PostgreSQL is running**
```bash
brew services list | grep postgresql
```

2. **(If needed) Create a database user**

3. **Create the database**
```bash
# Using createdb command (Add PostgreSQL bin directory to PATH)
createdb kainos-jobs

# OR create via psql if createdb command doesn't work
psql postgres -c "CREATE DATABASE \"kainos-jobs\";"
```

4. **Configure the `DATABASE_URL`**
Update `.env` with your connection string:
```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/kainos-jobs?schema=public"
```

5. **Run the initial migration**
```bash
npx prisma migrate dev --name init
```