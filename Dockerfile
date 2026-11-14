# Multi-stage build for Trello Web Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Argument for Google Client ID during build
ARG VITE_GOOGLE_CLIENT_ID=450608219312-6tmujfnjku68koncdd1hihnsl9td226a.apps.googleusercontent.com
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build production bundle with Vite
RUN npm run build

# Nginx production runner stage
FROM nginx:alpine AS runner

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output to Nginx HTML root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
