# Foodie Restaurant

A focused restaurant discovery and ordering frontend built from the Foodie Microservices Postman collection.

## Run locally

```bash
npm install
npm run dev
```

During local development, Vite proxies `/api` requests to the API gateway at `http://localhost:8080`, avoiding browser CORS preflights. Set `VITE_API_URL` when the frontend should call a different public gateway directly.

## Build

```bash
npm run build
```

## Run in Docker

Start Docker Desktop and the backend gateway on port 8080, then run:

```bash
docker compose up -d --build
```

Open http://localhost:3000. Nginx serves the production build, supports direct page URLs, and proxies `/api` to `host.docker.internal:8080`. The frontend port is bound to this computer only. Rebuild after source changes.

```bash
docker compose ps
docker compose logs -f frontend
docker compose down
```

These commands manage only the frontend; they do not stop the backend containers. The Docker URL has separate browser storage, so sign in again there.
