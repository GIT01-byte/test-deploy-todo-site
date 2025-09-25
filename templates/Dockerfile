    FROM nginx:stable-alpine

    # Если index.html лежит в той же директории, что и Dockerfile:
    COPY index.html /usr/share/nginx/html

    # Если index.html - результат сборки, нужно использовать multi-stage build:
    # FROM node:16-alpine AS builder
    # WORKDIR /app
    # COPY . .
    # RUN npm install && npm run build
    # FROM nginx:stable-alpine
    # COPY --from=builder /app/dist /usr/share/nginx/html

    COPY nginx.conf /etc/nginx/conf.d/default.conf

    EXPOSE 80 
    
