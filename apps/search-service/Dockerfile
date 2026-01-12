# Multi-stage build for search-service
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json nx.json tsconfig*.json ./
RUN npm ci --only=production=false
COPY apps/search-service ./apps/search-service
COPY libs ./libs
RUN npx nx build search-service --prod

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist/apps/search-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
ENV NODE_ENV=production PORT=3008
EXPOSE 3008
HEALTHCHECK --interval=30s --timeout=10s CMD wget -q --spider http://localhost:3008/api/health || exit 1
CMD ["node", "dist/main.js"]
