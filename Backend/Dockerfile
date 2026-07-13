FROM php:8.4-apache

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libsqlite3-dev \
    zip \
    && docker-php-ext-install pdo pdo_sqlite

RUN a2enmod rewrite

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]

CMD ["apache2-foreground"]