#!/bin/sh
set -e

cd /var/www/backend

# Ensure storage directory structure exists (important on first deploy)
mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs

# Fix permissions so www-data (php-fpm worker) can write
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Render nginx config — substitutes ${PORT} and ${SOCKET_SERVER_URL}
envsubst '${PORT} ${SOCKET_SERVER_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Laravel production optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run any pending migrations
php artisan migrate --force --no-interaction

# Create public/storage symlink (links public/storage → storage/app/public)
php artisan storage:link --force

exec /usr/bin/supervisord -n -c /etc/supervisord.conf
