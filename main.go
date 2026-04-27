package main

import (
	"embed"
	"log"
	"net/http"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	
	"github.com/JeanMRocha/site-eletrica/internal/auth"
	"github.com/JeanMRocha/site-eletrica/internal/conformidade"
	"github.com/JeanMRocha/site-eletrica/internal/standards"
	"github.com/JeanMRocha/site-eletrica/internal/studies"
	"github.com/JeanMRocha/site-eletrica/internal/knowledge"
)

//go:embed all:web/dist
var assets embed.FS

func main() {
	// Inicialização dos serviços (mesma lógica do cmd/api/main.go)
	authService := auth.NewInMemoryService([]auth.UserRecord{
		{
			User: auth.User{
				ID:          "usr_operator",
				Email:       "operator@example.com",
				DisplayName: "Operator",
				Permissions: []string{"auth.read", "projects.read", "calculations.read"},
			},
			PasswordHash: auth.HashPassword("change-me-now"),
		},
	})
	
	standardsService := standards.NewInMemoryService(standards.DefaultCatalog())
	knowledgeService := knowledge.NewService("./.mom")
	conformidadeService := conformidade.NewService(standardsService)
	
	sqliteStore, err := studies.NewSQLiteStore("./data/eletrica.db")
	if err != nil {
		log.Fatal(err)
	}
	
	studiesStore := studies.NewHybridStore(sqliteStore, nil)
	studiesService := studies.NewService(studiesStore, conformidadeService)
	
	// Inicia a API HTTP em background para compatibilidade com o frontend atual
	go func() {
		mux := http.NewServeMux()
		mux.Handle("/v1/auth/", auth.NewHandler(authService).Routes())
		mux.Handle("/v1/standards/", standards.NewHandler(standardsService).Routes())
		mux.Handle("/v1/conformidade/", conformidade.NewHandler(conformidadeService).Routes())
		mux.Handle("/v1/studies/", studies.NewHandler(studiesService).Routes())
		mux.Handle("/v1/knowledge/", knowledge.NewHandler(knowledgeService).Routes())
		mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte("ok"))
		})

		addr := ":8081" // Porta padrão usada no dev.ps1
		log.Printf("Desktop API listening on %s", addr)
		if err := http.ListenAndServe(addr, mux); err != nil {
			log.Printf("API error: %v", err)
		}
	}()

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err = wails.Run(&options.App{
		Title:             "Eletrica Pro",
		Width:             1280,
		Height:            800,
		MinWidth:          1024,
		MinHeight:         768,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         false,
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 9, G: 17, B: 29, A: 1},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
		},
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
