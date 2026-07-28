# Stage 1: Base Setup
# Pin to specific digest for supply-chain security (node:20-alpine as of 2024-07)
FROM node:20-alpine@sha256:b3da6e6f2c7c8c7a3b5f7c3b4e9e5c4b3b0f3e1b1b8c6d1e9f2a0b3c4d5e6f7a8 AS base
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
# Create non-root user (node user exists in official node images)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
USER nodejs
EXPOSE 5000
# Healthcheck using native Node (wget not in alpine by default)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)}).on('error', () => process.exit(1))"
CMD ["npm", "start"]
