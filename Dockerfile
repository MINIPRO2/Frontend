# Etapa 1: Construcción (Build)
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:4000
ARG VITE_REALTIME_URL=http://localhost:4001
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_REALTIME_URL=$VITE_REALTIME_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor estático Nginx
FROM nginx:stable-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
