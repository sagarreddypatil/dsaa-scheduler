FROM golang:1.21-alpine AS builder

WORKDIR /pb

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /pb/pocketbase


FROM alpine:latest

COPY --from=builder /pb/pocketbase /pb/pocketbase

# uncomment to copy the local pb_migrations dir into the image
COPY ./pb_migrations /pb/pb_migrations

# uncomment to copy the local pb_hooks dir into the image
# COPY ./pb_hooks /pb/pb_hooks

EXPOSE 8093

# start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8093"]