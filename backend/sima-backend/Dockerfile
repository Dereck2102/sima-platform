# syntax=docker/dockerfile:1

ARG NODE_VERSION=20
ARG NX_DAEMON=false

FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

ENV NX_DAEMON=${NX_DAEMON}
ENV CI=1

# Install dependencies
COPY package*.json nx.json tsconfig.base.json jest.config.ts jest.preset.js ./
COPY tsconfig.json ./
RUN npm ci

# Copy workspace sources
COPY apps ./apps
COPY apps-services ./apps-services
COPY libs ./libs
COPY migrations ./migrations
COPY typeorm.config.ts ./typeorm.config.ts

# Build target service
ARG SERVICE_NAME
RUN if [ -z "$SERVICE_NAME" ]; then echo "SERVICE_NAME build-arg is required" >&2; exit 1; fi
RUN npx nx build "$SERVICE_NAME" --configuration=production --skip-nx-cache

# Prune dev dependencies for runtime
RUN npm prune --omit=dev

# ---------------- Runtime image ----------------
FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Build arguments to locate dist output
ARG SERVICE_NAME
ARG OUTPUT_PATH

# Allow overriding dist path; default to dist/apps/<service>
ENV DIST_DIR=${OUTPUT_PATH:-dist/apps/${SERVICE_NAME}}

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/${DIST_DIR} ./dist

EXPOSE 3000
CMD ["node", "./dist/main.js"]
