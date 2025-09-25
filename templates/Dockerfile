    FROM nginx:stable-alpine

    # Если index.html лежит в той же директории, что и Dockerfile:
    COPY index.html /usr/share/nginx/html
    COPY nginx.conf /etc/nginx/conf.d/default.conf

    EXPOSE 80 
    
