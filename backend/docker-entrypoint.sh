#!/bin/sh

# Extract files
echo "Extract files from 7z file"
test -f voteraid_stuff.7z && 7z x -p$DJANGO_SECRET_KEY -ofiles/ voteraid_stuff.7z > /dev/null

# Wait for default database
if [ "$DEFAULT_DB_NAME" == "postgres" ]; then
    echo "Waiting for postgres..."
    while ! nc -z -v $DB_HOST $DB_PORT;
    do
      sleep 1
    done
    echo "PostgreSQL started"
fi

# Collect static files
echo "Collect static files"
python manage.py collectstatic --noinput

# Purge database
echo "Flush database"
python manage.py flush --noinput

# Create database migrations
echo "Run makemigrations"
python manage.py makemigrations voteraid --noinput

# Apply database migrations
echo "Apply database migrations"
python manage.py migrate --noinput

# Load data to database
echo "Populate database"
python manage.py loaddata files/voteraid_data.json

# Create superuser from env
# echo "Create superuser"
# python manage.py createsuperuser --noinput

# Start web server
echo "Start gunicorn server"
gunicorn --bind=0.0.0.0:8000 --workers=3 --reload --log-level debug finalproject.wsgi

exec "$@"