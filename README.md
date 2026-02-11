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


## Database Setup (PostgreSQL + Prisma)

1. **Verify PostgreSQL is running**
```bash
brew services list | grep postgresql
```

2. **(If needed) Create a database user**

3. **Generate prisma**
```bash
npx prisma generate
```

4. **Create the database**
```bash
# Using createdb command (Add PostgreSQL bin directory to PATH)
npm run db:create

# OR create via psql if createdb command doesn't work
psql postgres -c "CREATE DATABASE \"kainos-jobs\";"
```

5. **Configure the `DATABASE_URL`**
Update `.env` with your database connection details:
```
DB_USER=<your_pg_username>
DB_PASSWORD=<your_pg_password>
DB_HOST=localhost
DB_PORT=<your_pg_port>

DB_NAME=kainos-jobs
DB_SCHEMA=public
```

6. **Run the initial migration**
```bash
npm run db:migrate:init
```

7. **Update database to current build**
```bash
npm run db:migrate:update
```

8. **Seed database**
```bash
npm run db:seed 
```

9. **Test query database**
```bash
npm run db:query
```

## Setting up instance of test database

1. **Create test database**
```bash
npm run db:test:create
```

2. **Configure the test database connection**
Update `.env.test` with your data:
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
npm run db:test:migrate
```

4. **Seed the test database with mock data**
```bash
npm run db:test:seed
```

5. **Test query on the test database**
```bash
npm run db:test:query
```

6. **SQL to clear test database**
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