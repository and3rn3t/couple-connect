# Multi-stage build for production optimization
FROM node:22-alpine AS builder

# Build args for platform detection
ARG CONTAINER=alpine

# Set working directory
WORKDIR /app

# Set environment variable for Alpine detection
ENV CONTAINER=alpine
ENV FORCE_ALPINE=true

# Copy package files
COPY package*.json ./

# Install dependencies with native binaries
RUN npm ci --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
