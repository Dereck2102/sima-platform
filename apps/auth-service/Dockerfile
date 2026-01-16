# Multi-stage build for NestJS services
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source
COPY apps/auth-service ./apps/auth-service
COPY libs ./libs

# Build
RUN npx nx build auth-service --prod

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist/apps/auth-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/api/health || exit 1

CMD ["node", "dist/main.js"]
