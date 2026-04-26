package main

import (
	"log"
	"net/http"
	"os"

	"github.com/JeanMRocha/site-eletrica/internal/auth"
	"github.com/JeanMRocha/site-eletrica/internal/conformidade"
	"github.com/JeanMRocha/site-eletrica/internal/standards"
	"github.com/JeanMRocha/site-eletrica/internal/studies"
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
	standardsService := standards.NewInMemoryService(standards.DefaultCatalog())
	conformidadeService := conformidade.NewService(standardsService)
	sqliteStore, err := studies.NewSQLiteStore(getenv("DATABASE_PATH", "./data/eletrica.db"))
	if err != nil {
		log.Fatal(err)
	}

	var remoteStore studies.Repository
	pgURL := os.Getenv("POSTGRES_URL")
	if pgURL != "" {
		pgStore, err := studies.NewPostgresStore(pgURL)
		if err != nil {
			log.Printf("warning: postgres connection failed, starting in offline-only mode: %v", err)
		} else {
			remoteStore = pgStore
		}
	}

	studiesStore := studies.NewHybridStore(sqliteStore, remoteStore)
	defer func() {
		if err := studiesStore.Close(); err != nil {
			log.Printf("close study store: %v", err)
		}
	}()
	studiesService := studies.NewService(studiesStore, conformidadeService)

	handler := auth.NewHandler(service)
	standardsHandler := standards.NewHandler(standardsService)
	conformidadeHandler := conformidade.NewHandler(conformidadeService)
	studiesHandler := studies.NewHandler(studiesService)

	root := http.NewServeMux()
	root.Handle("/v1/auth", handler.Routes())
	root.Handle("/v1/auth/", handler.Routes())
	root.Handle("/v1/standards", standardsHandler.Routes())
	root.Handle("/v1/standards/", standardsHandler.Routes())
	root.Handle("/v1/conformidade", conformidadeHandler.Routes())
	root.Handle("/v1/conformidade/", conformidadeHandler.Routes())
	root.Handle("/v1/studies", studiesHandler.Routes())
	root.Handle("/v1/studies/", studiesHandler.Routes())
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
