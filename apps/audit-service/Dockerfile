# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build the service
RUN npx nx build audit-service --prod

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist/apps/audit-service ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3012

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3012/health || exit 1

# Start the service
CMD ["node", "dist/main.js"]
