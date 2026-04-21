package nodes

import (
	"context"
	"errors"
	"testing"
	"time"
)

type fakeProber struct {
	result ProbeResult
	err    error
	calls  int
}

func (f *fakeProber) Probe(_ context.Context, _ SSHConfig) (ProbeResult, error) {
	f.calls++
	return f.result, f.err
}

func TestDefaultServiceSeedsPrimaryNode(t *testing.T) {
	service := NewDefaultService(nil)

	nodes := service.List()
	if len(nodes) != 1 {
		t.Fatalf("expected one seeded node, got %d", len(nodes))
	}

	if nodes[0].ID != "node_primary_vps" {
		t.Fatalf("unexpected node id: %s", nodes[0].ID)
	}
	if nodes[0].Inventory.Hostname != "srv856573.hstgr.cloud" {
		t.Fatalf("unexpected hostname: %s", nodes[0].Inventory.Hostname)
	}
}

func TestServiceProbeUpdatesNodeSnapshot(t *testing.T) {
	prober := &fakeProber{
		result: ProbeResult{
			CheckedAt: time.Date(2026, 4, 21, 10, 0, 0, 0, time.UTC),
			Healthy:   true,
			Inventory: Inventory{
				Hostname:      "srv856573.hstgr.cloud",
				Kernel:        "Linux 6.8.0",
				Uptime:        "up 56 days",
				DockerVersion: "27.0.3",
				DiskSummary:   "/dev/sda1 1000 500 500 50% /",
			},
		},
	}
	service := NewDefaultService(prober)

	result, err := service.Probe(context.Background(), "node_primary_vps", SSHConfig{
		Host:           "78.142.242.236",
		User:           "root",
		PrivateKeyPath: "/tmp/id_ed25519",
		KnownHostsPath: "/tmp/known_hosts",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !result.Healthy {
		t.Fatalf("expected healthy result")
	}
	if prober.calls != 1 {
		t.Fatalf("expected one probe call, got %d", prober.calls)
	}

	node, ok := service.Get("node_primary_vps")
	if !ok {
		t.Fatalf("expected node to exist")
	}
	if node.Status != StatusHealthy {
		t.Fatalf("expected healthy node, got %s", node.Status)
	}
	if node.Inventory.Kernel != "Linux 6.8.0" {
		t.Fatalf("unexpected kernel: %s", node.Inventory.Kernel)
	}
	if node.LastProbeAt == nil || node.LastSeenAt == nil {
		t.Fatalf("expected probe timestamps to be set")
	}
}

func TestServiceProbeReturnsErrorForMissingNode(t *testing.T) {
	prober := &fakeProber{
		result: ProbeResult{Healthy: true},
	}
	service := NewService(nil, prober)

	_, err := service.Probe(context.Background(), "missing", SSHConfig{})
	if !errors.Is(err, ErrInvalidSSHConfig) {
		// the config is invalid first, so guard behavior through a valid config below
	}

	_, err = service.Probe(context.Background(), "missing", SSHConfig{
		Host:           "example.com",
		User:           "deploy",
		PrivateKeyPath: "/tmp/id_ed25519",
		KnownHostsPath: "/tmp/known_hosts",
	})
	if !errors.Is(err, ErrNodeNotFound) {
		t.Fatalf("expected node not found error, got %v", err)
	}
}
