FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Pass environment variables for Vite build
ARG VITE_API_URL
ARG VITE_AUTH_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL

# Build the Vite app
RUN npm run build

# Production nginx image
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Setup routing for React Router
RUN echo $'server {\\n\\
    listen 80;\\n\\
    location / {\\n\\
        root   /usr/share/nginx/html;\\n\\
        index  index.html index.htm;\\n\\
        try_files $uri $uri/ /index.html;\\n\\
    }\\n\\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
