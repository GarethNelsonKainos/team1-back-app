# team1-back-app 
Team 1 Backend Application Feb/March 2026

## First Start
```bash
npm install
cp .env.example .env
npm run dev
```

**Configure .env with your frontend connection**
FRONTEND_URL="http://localhost:<FRONTEND_PORT>"

```bash
npm run dev
```


Health check: http://localhost:${PORT}/health (for the default port this is http://localhost:3001/health)

## Demo Users
User1:
email: alice@example.com
password: password1

User2:
email: bob@example.com
password: password2

Admin:
email: charlie@example.com
password: adminpass


## Database Setup (PostgreSQL + Prisma)

1. **Verify PostgreSQL is running**
```bash
brew services list | grep postgresql
```

2. **(If needed) Create a database user**

3. **Configure the database connection in .env**
Update `.env` with your database connection details:

DB_USER=<your_pg_username>
DB_PASSWORD=<your_pg_password>
DB_HOST=localhost
DB_PORT=<your_pg_port>

DB_NAME=kainos-jobs
DB_SCHEMA=public

4. **Generate local version of prisma**
```bash
npx prisma generate
```

5. **Create local copy of the database**
```bash
npm run db:migrate
```

6. **Seed database**
```bash
npm run db:seed
```

9. **Test query database**
```bash
npm run db:query
```

10. **Altering the database schema**

Make required updates to prisma/schema.prisma

```bash
npx prisma migrate dev --name <alteration_detail >
```


## Setting up instance of test database

1. **Configure the test database connection**
Update `.env.test` with your data:
```
DB_USER=<your_pg_username>
DB_PASSWORD=<your_pg_password>
DB_HOST=localhost
DB_PORT=<your_pg_port>

DB_NAME=kainos-jobs-test
DB_SCHEMA=public
```

2. **Create local copy of the test database**
```bash
npm run db:test:migrate
```

3. **Seed the test database with mock data**
```bash
npm run db:test:seed
```

4. **Test query on the test database**
```bash
npm run db:test:query
```

5. **SQL to clear test database**
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



## Linting

This project uses **Biome** for fast, comprehensive code linting and formatting.
- Configuration file: `biome.json`
- Lints TypeScript files in the `/src/` directory
- Follows recommended rules with consistent formatting
- Integrates with CI/CD pipeline

Available Commands:
```bash
npm run check        # Check for linting issues
npm run check:fix    # Automatically fix linting issues
```

## Testing
This project uses **Vitest** and **Supertest** for unit and coverage tests
Tests are located in the `/test/` directory and mirror the `/src/` structure:

Available Commands:
```bash
npm run test             # Run all tests and output results
npm run test:coverage    # Run all tests and display coverage report with 80% thresholds
```