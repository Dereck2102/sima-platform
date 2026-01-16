# Multi-stage build for NestJS services
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

RUN npm ci --only=production=false

COPY apps/tenant-service ./apps/tenant-service
COPY libs ./libs

RUN npx nx build tenant-service --prod

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist/apps/tenant-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=3003

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3003/api/health || exit 1

CMD ["node", "dist/main.js"]
