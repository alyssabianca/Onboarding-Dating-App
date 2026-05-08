# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: PHP backend + Nginx
FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    nginx \
    supervisor \
    gettext \
    zip \
    unzip \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    mysql-client

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        pdo \
        pdo_mysql \
        zip \
        exif \
        pcntl \
        mbstring \
        opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

COPY backend/composer.json backend/composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY backend/ ./

COPY --from=frontend-builder /app/dist /var/www/frontend/dist

COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

RUN mkdir -p bootstrap/cache && chmod -R 775 bootstrap/cache

EXPOSE 8080

CMD ["/start.sh"]
