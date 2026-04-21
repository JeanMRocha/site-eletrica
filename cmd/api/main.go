package main

import (
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/JeanMRocha/vps-control/internal/auth"
	"github.com/JeanMRocha/vps-control/internal/nodes"
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
	primaryNode := nodes.NewPrimaryNode()
	primaryNode.Host = getenv("SSH_HOST", primaryNode.Host)
	primaryNode.Port = getenvInt("SSH_PORT", primaryNode.Port)
	primaryNode.User = getenv("SSH_USER", primaryNode.User)
	primaryNode.Inventory.IPv4 = primaryNode.Host
	primaryNode.Inventory.SSHUser = primaryNode.User
	nodesService := nodes.NewService([]nodes.Node{primaryNode}, nodes.NewSSHProbe())
	nodesHandler := nodes.NewHandler(nodesService, nodes.SSHConfig{
		Host:           getenv("SSH_HOST", "78.142.242.236"),
		Port:           getenvInt("SSH_PORT", 22),
		User:           getenv("SSH_USER", "root"),
		PrivateKeyPath: getenv("SSH_PRIVATE_KEY_PATH", "~/.ssh/id_ed25519"),
		KnownHostsPath: getenv("SSH_KNOWN_HOSTS_PATH", "~/.ssh/known_hosts"),
	})

	root := http.NewServeMux()
	root.Handle("/v1/auth/", handler.Routes())
	root.Handle("/v1/nodes", nodesHandler.Routes())
	root.Handle("/v1/nodes/", nodesHandler.Routes())

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

func getenvInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}

	return parsed
}
