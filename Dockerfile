FROM golang:1.21-alpine AS backend

WORKDIR /pb

COPY ./backend/go.mod ./backend/go.sum ./
RUN go mod download

COPY ./backend/*.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /pb/pocketbase

FROM node:21-alpine AS frontend

WORKDIR /app

COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile

COPY ./ ./
RUN yarn build

FROM alpine:latest

COPY --from=backend /pb/pocketbase /pb/pocketbase
COPY --from=frontend /app/dist /pb/pb_public

COPY ./backend/pb_migrations /pb/pb_migrations

EXPOSE 8093

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8093"]