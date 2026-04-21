package nodes

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"
)

type fakeSSHRunner struct {
	outputs map[string]string
	errs    map[string]error
	seen    []string
}

func (f *fakeSSHRunner) Run(_ context.Context, _ SSHConfig, command string) (string, error) {
	f.seen = append(f.seen, command)
	if err, ok := f.errs[command]; ok {
		return "", err
	}
	return f.outputs[command], nil
}

func TestSSHConfigValidation(t *testing.T) {
	cfg := SSHConfig{}
	if err := cfg.validate(); err == nil || !strings.Contains(err.Error(), "host is required") {
		t.Fatalf("expected host validation error, got %v", err)
	}
}

func TestSSHProbeCollectsInventory(t *testing.T) {
	runner := &fakeSSHRunner{
		outputs: map[string]string{
			"hostname":  "vps-main\n",
			"uname -sr": "Linux 6.8.0\n",
			"uptime -p": "up 2 days, 3 hours\n",
			"df -P /":   "Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/sda1 1000 500 500 50% /\n",
			"docker version --format '{{.Server.Version}}'": "27.0.3\n",
		},
	}
	probe := NewSSHProbeWithRunner(runner)
	probe.now = func() time.Time { return time.Date(2026, 4, 21, 10, 0, 0, 0, time.UTC) }

	result, err := probe.Probe(context.Background(), SSHConfig{
		Host:           "example.com",
		User:           "deploy",
		PrivateKeyPath: "/tmp/id_ed25519",
		KnownHostsPath: "/tmp/known_hosts",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result.Inventory.Hostname != "vps-main" {
		t.Fatalf("unexpected hostname: %s", result.Inventory.Hostname)
	}
	if result.Inventory.Kernel != "Linux 6.8.0" {
		t.Fatalf("unexpected kernel: %s", result.Inventory.Kernel)
	}
	if !result.Healthy {
		t.Fatalf("expected healthy result")
	}
	if len(runner.seen) != 5 {
		t.Fatalf("expected 5 commands, got %d", len(runner.seen))
	}
}

func TestSSHProbeKeepsOptionalWarnings(t *testing.T) {
	runner := &fakeSSHRunner{
		outputs: map[string]string{
			"hostname":  "vps-main\n",
			"uname -sr": "Linux 6.8.0\n",
			"uptime -p": "up 2 days, 3 hours\n",
			"df -P /":   "Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/sda1 1000 500 500 50% /\n",
		},
		errs: map[string]error{
			"docker version --format '{{.Server.Version}}'": errors.New("docker not installed"),
		},
	}
	probe := NewSSHProbeWithRunner(runner)

	result, err := probe.Probe(context.Background(), SSHConfig{
		Host:           "example.com",
		User:           "deploy",
		PrivateKeyPath: "/tmp/id_ed25519",
		KnownHostsPath: "/tmp/known_hosts",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result.Healthy {
		t.Fatalf("expected degraded health when optional command fails")
	}
	if len(result.Warnings) != 1 {
		t.Fatalf("expected one warning, got %d", len(result.Warnings))
	}
}
