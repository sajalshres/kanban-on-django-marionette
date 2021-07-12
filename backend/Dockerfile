FROM python:3.8

# Make sure logs are received in a timely manner
ENV PYTHONBUFFERED 1

# Install and update system packages
RUN apt-get update \
    && apt-get upgrade -y \
    && apt install -y netcat

# Set working directory
WORKDIR /app

# Install Python packages
COPY ./requirements/base.txt /app/requirements/base.txt
COPY ./requirements/develop.txt /app/requirements/develop.txt
RUN pip install --no-cache-dir -r /app/requirements/develop.txt

# copy entrypoint.sh
COPY ./entrypoint.sh .

# Copy the project files
COPY . .

# Wait for database to be ready, run database migrations, collectstatic for nginx to serve and then start the app
ENTRYPOINT [ "/app/entrypoint.sh" ]
