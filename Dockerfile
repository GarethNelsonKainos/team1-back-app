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
# dotenv is now in dependencies so we can safely omit devDeps.
# prisma CLI (devDep) is not needed here — we copy the pre-generated
# client from the builder stage instead of re-running prisma generate.
RUN npm ci --omit=dev && npm cache clean --force

# Copy the Prisma-generated query engine from the builder — this is what
# @prisma/client uses at runtime to talk to the database.
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/dist ./dist

USER node

EXPOSE 3001

CMD ["node", "dist/index.js"]
