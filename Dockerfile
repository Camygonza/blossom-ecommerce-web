# Etapa 1: build de Vite
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: nginx sirve la SPA y reenvía /api al backend (mismo origen: sin CORS).
# La plantilla se renderiza al arrancar con las variables de entorno (envsubst de la imagen oficial).
FROM nginx:1.27-alpine
# valores por defecto para docker compose; en otra plataforma se sobrescriben
ENV API_UPSTREAM=http://api:8080 \
    API_HOST=api
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
