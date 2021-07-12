#!/bin/bash

wait_for_postgres() {
    echo "Waiting for postgres..."
    while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
      sleep 0.1
    done
    echo "PostgreSQL started"
}

wait_for_postgres

# python manage.py flush --no-input
python manage.py makemigrations
python manage.py migrate

exec "$@"
