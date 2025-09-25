FROM nginx:stable-alpine

COPY index.html /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173
RUN ["nginx", "-g", "daemon off;"]