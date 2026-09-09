FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=https://fetch-error-handling-production.up.railway.app
ARG VITE_PAYPAL_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL \
    VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
