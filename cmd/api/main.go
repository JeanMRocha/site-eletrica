package main

import (
	"log"
	"net/http"
	"os"

	"github.com/JeanMRocha/site-eletrica/internal/auth"
)

func main() {
	service := auth.NewInMemoryService([]auth.UserRecord{
		{
			User: auth.User{
				ID:          "usr_operator",
				Email:       getenv("AUTH_DEMO_EMAIL", "operator@example.com"),
				DisplayName: getenv("AUTH_DEMO_NAME", "Operator"),
				Permissions: []string{"auth.read", "projects.read", "calculations.read"},
			},
			PasswordHash: auth.HashPassword(getenv("AUTH_DEMO_PASSWORD", "change-me-now")),
		},
	})

	handler := auth.NewHandler(service)

	root := http.NewServeMux()
	root.Handle("/v1/auth/", handler.Routes())
	root.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	addr := getenv("HTTP_ADDR", ":8080")
	log.Printf("api listening on %s", addr)
	if err := http.ListenAndServe(addr, root); err != nil {
		log.Fatal(err)
	}
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
