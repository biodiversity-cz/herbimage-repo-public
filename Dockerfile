# syntax=docker/dockerfile:1

# ---------- build stage ----------
# Build the static bundle with a pinned Node LTS image.
FROM node:26-alpine AS build
WORKDIR /app

# Install dependencies first so this layer is cached between builds.
COPY package.json package-lock.json ./
RUN npm ci

# Build the application (no build-time env needed – runtime config is in nginx).
COPY . .
RUN npm run build

# ---------- runtime stage ----------
# Serve the static files with a rootless nginx; /api is proxied to PostgREST.
FROM nginx:stable-alpine AS runtime

# PostgREST upstream, overridable at container start (envsubst template).
ENV POSTGREST_UPSTREAM=http://postgrest:3000

# The envsubst entrypoint renders server blocks into /etc/nginx/conf.d.
# Make it writable for the unprivileged nginx user (uid 101).
RUN mkdir -p /etc/nginx/conf.d && chown 101:101 /etc/nginx/conf.d

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# nginx runs as uid 101 in the official image.
USER nginx

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1
