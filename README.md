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

2. **Configure the database connection**
Update `.env` with your database connection details:
```
DB_USER=<your_pg_username>
DB_PASSWORD=<your_pg_password>
DB_HOST=localhost
DB_PORT=<your_pg_port>

DB_NAME=kainos-jobs
DB_SCHEMA=public
```

3. **Run the initial migration**
```bash
npx prisma migrate dev --name init
```

## Linting

This project uses **Biome** for fast, comprehensive code linting and formatting.

### Available Commands
```bash
npm run lint        # Check for linting issues
npm run lint:fix    # Automatically fix linting issues
```

### Configuration
- Configuration file: `biome.json`
- Lints TypeScript files in the `/src/` directory
- Follows recommended rules with consistent formatting
- Integrates with CI/CD pipeline

### Testing

Tests are located in the `/test/` directory and mirror the `/src/` structure:
- Unit tests use Vitest + Supertest
- Run `npm test` for single test run
- Run `npm run test:coverage` for coverage report with 80% thresholds
- Coverage reports generated in `/coverage/`
4. **Update database to current build**
```bash
npx prisma migrate dev
```



## Test database setup

1. **Create test database**
```bash
createdb kainos-jobs-test
```

2. **Configure the test database connection**
Update `.env.test` with your dav:
```
DB_USER=<your_pg_username>
DB_PASSWORD=<your_pg_password>
DB_HOST=localhost
DB_PORT=<your_pg_port>

DB_NAME=kainos-jobs-test
DB_SCHEMA=public
```

3. **Apply current migrations to the test database**
```bash
npx dotenv -e .env.test -- npx prisma migrate deploy
```

4. **Seed the test database with mock data**
```bash
npx dotenv -e .env.test -- tsx prisma/seed-test-db.ts
```

5. **Test query on the test database**
```bash
npx dotenv -e .env.test -- tsx prisma/query-test-db.ts
```

6. **To clear test database**
```sql
DO
$$
DECLARE
    r RECORD;
BEGIN
    -- truncate all tables in the public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE;';
    END LOOP;
END;
$$;
```