# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments for production URLs
ARG VITE_APP_SERVER_GRAPHQL_URL=http://127.0.0.1:8000/graphql
ARG VITE_SERVER_GRAPHQL_WS_URL=ws://127.0.0.1:8000/graphql/ws

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 3002

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
