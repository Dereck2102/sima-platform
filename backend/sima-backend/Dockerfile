FROM node:20-alpine

WORKDIR /app

# Install dependencies first (caching)
COPY package*.json nx.json tsconfig*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the specific service
ARG SERVICE_NAME
RUN npx nx build ${SERVICE_NAME} --configuration=production

# Set environment
ENV NODE_ENV=production

# Start the service
# Attempts to find the main file in either apps or apps-services location
CMD /bin/sh -c "if [ -f dist/apps/${SERVICE_NAME}/main.js ]; then node dist/apps/${SERVICE_NAME}/main.js; else node dist/apps-services/${SERVICE_NAME}/main.js; fi"
