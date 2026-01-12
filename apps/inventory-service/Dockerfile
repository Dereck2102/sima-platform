# Multi-stage build for NestJS services
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

RUN npm ci --only=production=false

COPY apps/inventory-service ./apps/inventory-service
COPY libs ./libs

RUN npx nx build inventory-service --prod

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist/apps/inventory-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "dist/main.js"]
