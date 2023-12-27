# schd

I made this because I needed a single source of truth for everything I needed to
do, and I wanted to just be able to look at a list and pick a task.

This is a progressive web app, and runs a service worker to show notifications.

Currently, this doesn't support due dates

## Tech Stack

- React, built with Vite
- TailwindCSS
- [Pocketbase](https://pocketbase.io/)
  - With custom hooks for notifications
  - The custom API is undocumented, but it's pretty simple

## Development

### Dependencies

- NodeJS + Yarn
- One of
  - Go 1.21+
  - Docker

### Frontend

```bash
# Install dependencies
yarn

# Run the dev server
yarn dev
```

### Backend

```bash
cd backend

go run main.go serve --http=0.0.0.0:8093
```

Any changes you make to the database will be recorded in `backend/pb_migrations`
which is included in the build

If you want to mess with the server location, see `src/Login.tsx:3`

### Frozen Backend

If you don't expect to make changes to the backend, you can run it over Docker

```bash
docker compose build
docker compose up
```

Note that this also runs the frontend (under route `/`). To see the development
version instead, go to `localhost:5173` served by Vite.

## Deployment

I use [Fly](https://fly.io) to deploy this. The config is in `fly.toml`.
There is a single `Dockerfile` where the frontend and backend are built.

The frontend is served by the backend as static files, so React uses hash (`/#/`) routing.
