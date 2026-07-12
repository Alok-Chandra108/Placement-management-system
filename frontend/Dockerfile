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
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
