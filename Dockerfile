FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_STREAMVI_API_HOST
ARG VITE_CENTRIFUGO_HOST

ENV VITE_STREAMVI_API_HOST=$VITE_STREAMVI_API_HOST
ENV VITE_CENTRIFUGO_HOST=$VITE_CENTRIFUGO_HOST

RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5000

CMD ["nginx", "-g", "daemon off;"]
