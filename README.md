# schd

I made this because I needed a single source of truth for everything I needed to
do, and I wanted to just be able to look at a list and pick a task.

This is a progressive web app and runs a service worker to show notifications.

Currently, this doesn't support due dates

## Design

### Basics

There are two constructs: tasks and state changes.

Tasks are associated with a user, and each state change is associated with a
task. The outcome of the last state change is cached in the task.

#### Tasks

A task has the following fields

- Title
- Description (rendered with markdown)
- Priority (lower is more important)

#### State Changes

A task can have the following states

- CURRENT
- READY
- DONE
- SLEEP (currently unused)

The application is set up for a single `CURRENT` task, but it may or may not
work with multiple. Currently, the only way to have multiple current tasks is to
use the Pocketbase API.

Every time you press a button, a state change is recorded. This could be

- finishing the current task (CURRENT -> DONE)
- pressing idle (CURRENT -> READY)
- scheduling a task (CURRENT -> READY, and READY->CURRENT for the next task)

### Notifications

**If you're on iOS, add this app to your home screen to get notifications**

On every state change, a notification is sent to the user. This is done through
the Web Push API.

To enable notifications

- Click on your profile picture/initial
- Click on "Enable Notifications", and approve the prompt
- Click on Subscribe

Only one device can be subscribed to notifications at a time. This is a known
limitation of my backend.

### API

There's a (somewhat limited) API. To get a key, click on your profile -> API
Token.

The current endpoints are

- `GET /api/v1/evict` <- evict (idle) the current task

Personally, I use this to remind me to switch tasks every hour using iOS shortcuts.

### Pocketbase API

If you wish to do so, you can interact with the Pocketbase API directly. See
[their docs](https://pocketbase.io/docs/) for more information.

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

The frontend is served by the backend as static files, so React uses hash
(`/#/`) routing.
