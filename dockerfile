# Multi-stage Dockerfile for production
FROM node:22-bullseye-slim AS builder

WORKDIR /app
ENV NODE_ENV=development

# Install deps (dev included) to build and generate Prisma client
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Generate Prisma client (build stage has dev deps installed)
RUN npx prisma generate

### Runtime stage
FROM node:22-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --production --silent

# Copy built app and prisma artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create non-root user and set permissions
RUN addgroup --system app && adduser --system --group app && chown -R app:app /app
USER app

EXPOSE 3000
CMD ["node", "dist/main"]
