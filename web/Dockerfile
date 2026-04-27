# Stage 1: Build React App
FROM node:22-alpine AS builder

WORKDIR /app/web

# Copy package files
COPY web/package*.json ./
RUN npm install

# Copy source code (and necessary root files for governance)
COPY web ./
COPY AGENTS.md .agent ../
COPY docs ../docs

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy built assets from builder
COPY --from=builder /app/web/dist /usr/share/nginx/html

# Copy custom nginx config if needed (for SPA routing)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /v1 { \
        proxy_pass http://api:8080; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
