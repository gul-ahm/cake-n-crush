# Multi-stage Dockerfile for Cake N Crush production

# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy root package and install deps (front-end)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy server package.json and install server deps (will reuse for runtime pruning)
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --production

# Copy source
COPY . .

# Build frontend
RUN npm run build:frontend

# ---- Runtime Stage ----
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production
# Copy only necessary files
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/index.js ./server/index.js

# Environment variables expected at runtime:
# ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET, SESSION_TIMEOUT, INTERNAL_API_KEY, CORS_ORIGIN, PORT

EXPOSE 3001
CMD ["node", "server/index.js"]
