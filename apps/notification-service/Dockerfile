# Multi-stage build for notification-service
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json nx.json tsconfig*.json ./
RUN npm ci --only=production=false
COPY apps/notification-service ./apps/notification-service
COPY libs ./libs
RUN npx nx build notification-service --prod

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist/apps/notification-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
ENV NODE_ENV=production PORT=3006
EXPOSE 3006
HEALTHCHECK --interval=30s --timeout=10s CMD wget -q --spider http://localhost:3006/api/health || exit 1
CMD ["node", "dist/main.js"]
