package nodes

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"sync"
	"time"
)

var (
	ErrNodeNotFound     = errors.New("node not found")
	ErrProbeUnavailable = errors.New("probe unavailable")
)

type Prober interface {
	Probe(context.Context, SSHConfig) (ProbeResult, error)
}

type Service struct {
	mu    sync.RWMutex
	nodes map[string]Node
	probe Prober
}

func NewService(seed []Node, probe Prober) *Service {
	nodes := make(map[string]Node, len(seed))
	for _, node := range seed {
		nodes[node.ID] = node
	}

	return &Service{
		nodes: nodes,
		probe: probe,
	}
}

func NewDefaultService(probe Prober) *Service {
	return NewService([]Node{NewPrimaryNode()}, probe)
}

func (s *Service) List() []Node {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]Node, 0, len(s.nodes))
	for _, node := range s.nodes {
		items = append(items, node)
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].ID < items[j].ID
	})
	return items
}

func (s *Service) Get(id string) (Node, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	node, ok := s.nodes[id]
	return node, ok
}

func (s *Service) Probe(ctx context.Context, id string, cfg SSHConfig) (ProbeResult, error) {
	if s.probe == nil {
		return ProbeResult{}, ErrProbeUnavailable
	}

	result, err := s.probe.Probe(ctx, cfg)
	if err != nil {
		return ProbeResult{}, err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	node, ok := s.nodes[id]
	if !ok {
		return ProbeResult{}, ErrNodeNotFound
	}

	now := time.Now()
	if result.Healthy {
		node.Status = StatusHealthy
	} else {
		node.Status = StatusDegraded
	}
	node.LastProbeAt = &now
	node.LastSeenAt = &now
	node.Inventory.Hostname = result.Inventory.Hostname
	node.Inventory.Kernel = result.Inventory.Kernel
	node.Inventory.Uptime = result.Inventory.Uptime
	node.Inventory.DockerVersion = result.Inventory.DockerVersion
	node.Inventory.DiskSummary = result.Inventory.DiskSummary
	s.nodes[id] = node

	return result, nil
}

func (s *Service) Seed(node Node) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.nodes[node.ID] = node
}

func (s *Service) Snapshot(id string) (Node, error) {
	node, ok := s.Get(id)
	if !ok {
		return Node{}, fmt.Errorf("%w: %s", ErrNodeNotFound, id)
	}
	return node, nil
}
