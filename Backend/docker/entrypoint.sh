#!/bin/sh
set -e

if [ ! -f /var/www/html/vendor/autoload.php ]; then
    echo "Installation des dépendances Composer..."
    composer install --no-interaction
fi

exec "$@"