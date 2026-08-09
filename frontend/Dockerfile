# Stage 1: Base Setup
FROM node:20-alpine AS base
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
FROM nginx:alpine AS production
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
