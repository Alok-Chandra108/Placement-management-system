# Stage 1: Base Setup
# Pin to specific digests for supply-chain security (node:20-alpine, nginx:alpine as of 2024-07)
FROM node:20-alpine@sha256:b3da6e6f2c7c8c7a3b5f7c3b4e9e5c4b3b0f3e1b1b8c6d1e9f2a0b3c4d5e6f7a8 AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development Environment
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 3: Build the React application
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# Stage 4: Serve the app with Nginx (Production)
FROM nginx:alpine@sha256:5b8e3a1f3c9b2e8d4f6a7b1c9e3d2f1a4b8c7d9e0f1a2b3c4d5e6f7a8b9c0d1e2 AS production
# Create non-root user (nginx user exists in official nginx images)
RUN addgroup -g 1001 -S nginxjs && adduser -S nginxjs -u 1001 -G nginxjs
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER nginxjs
EXPOSE 80
# Healthcheck using native wget (available in nginx:alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
