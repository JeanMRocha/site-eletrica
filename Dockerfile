# Stage 1: Build the Go API
FROM golang:1.25.1-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the API binary
RUN CGO_ENABLED=1 GOOS=linux go build -o api-server ./cmd/api/main.go

# Stage 2: Runtime
FROM alpine:latest

WORKDIR /app

# Add dependencies for CGO (SQLite)
RUN apk add --no-cache ca-certificates musl

# Copy the binary from builder
COPY --from=builder /app/api-server .
COPY --from=builder /app/.mom ./.mom

# Create data directory for SQLite fallback
RUN mkdir -p /app/data

# Expose API port
EXPOSE 8080

CMD ["./api-server"]
