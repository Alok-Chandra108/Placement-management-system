# Stage 1: Base Setup
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development Environment
FROM base AS development
RUN npm install
COPY . .
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Stage 3: Production Environment
FROM base AS production
RUN npm install --omit=dev
COPY . .
ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "start"]
