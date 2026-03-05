# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma/ ./prisma/
RUN npm ci && npx prisma generate

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Bundle the seed script so we can run it with plain node (no tsx needed)
RUN npx esbuild prisma/test-scripts/seed-test-db-v2.ts --bundle --platform=node --format=cjs --outfile=dist/seed.cjs --packages=external


# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled app and Prisma-generated query engine from builder
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/dist ./dist

# Copy Prisma CLI, dotenv, and migrations for `prisma migrate deploy`
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv
COPY prisma/schema.prisma ./prisma/
COPY prisma/migrations ./prisma/migrations
COPY prisma.config.ts ./

# Bundled seed script (built by esbuild in builder stage)
COPY --from=builder /app/dist/seed.cjs ./dist/seed.cjs

# Startup script: migrate then start
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

USER node

EXPOSE 3001

CMD ["sh", "./entrypoint.sh"]
