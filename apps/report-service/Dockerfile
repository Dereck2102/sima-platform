# Multi-stage build for report-service
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json nx.json tsconfig*.json ./
RUN npm ci --only=production=false
COPY apps/report-service ./apps/report-service
COPY libs ./libs
RUN npx nx build report-service --prod

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist/apps/report-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
ENV NODE_ENV=production PORT=3007
EXPOSE 3007
HEALTHCHECK --interval=30s --timeout=10s CMD wget -q --spider http://localhost:3007/api/health || exit 1
CMD ["node", "dist/main.js"]
