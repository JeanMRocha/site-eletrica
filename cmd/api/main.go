package main

import (
	"log"
	"net/http"
	"os"

	"github.com/JeanMRocha/vps-control/internal/auth"
)

func main() {
	service := auth.NewInMemoryService([]auth.UserRecord{
		{
			User: auth.User{
				ID:          "usr_operator",
				Email:       getenv("AUTH_DEMO_EMAIL", "operator@example.com"),
				DisplayName: getenv("AUTH_DEMO_NAME", "Operator"),
				Permissions: []string{"auth.read", "nodes.read", "incidents.read", "dashboard.read"},
			},
			PasswordHash: auth.HashPassword(getenv("AUTH_DEMO_PASSWORD", "change-me-now")),
		},
	})

	handler := auth.NewHandler(service)

	addr := getenv("HTTP_ADDR", ":8080")
	log.Printf("auth api listening on %s", addr)
	if err := http.ListenAndServe(addr, handler.Routes()); err != nil {
		log.Fatal(err)
	}
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
