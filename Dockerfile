# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma/ ./prisma/
RUN npm ci && npx prisma generate

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build


# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY prisma/ ./prisma/
# dotenv is in devDependencies but used in production code, so keep all deps.
RUN npm ci && npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
