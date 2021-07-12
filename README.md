# kanban-on-django-marionette

A KanBan application using django and backbone.marionette JS.

## Requirements

- Docker
- Docker-Compose
- Node.js

## Local Development

### Start Backend

```bash
> docker-compose up --build
```

### Build Frontend

```bash
# Install dependencies
> cd frontend && npm install

# Build webpack
> npm run watch
```

Open browser and visit: http://localhost:8000
