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

# Stage 3: Test Environment
# Installs ALL deps (including devDependencies like jest) so tests can run
FROM base AS test
RUN npm install
COPY . .
ENV PORT=5000
ENV NODE_ENV=test
CMD ["npm", "test"]

# Stage 4: Production Environment
FROM base AS production
RUN npm install --omit=dev
# Create non-root user (node user exists in official node images)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
COPY --chown=nodejs:nodejs . .
USER nodejs
ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000
# Healthcheck using native Node probing deep health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => { (r.statusCode === 200 || r.statusCode === 503) ? process.exit(0) : process.exit(1); }).on('error', () => process.exit(1));"
CMD ["npm", "start"]
