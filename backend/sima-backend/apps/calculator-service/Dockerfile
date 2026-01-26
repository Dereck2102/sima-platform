FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o calculator-service .

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/calculator-service .

EXPOSE 3009

CMD ["./calculator-service"]
