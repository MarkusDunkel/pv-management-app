FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.28-alpine

# Static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx-Template (für envsubst im Entrypoint)
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
