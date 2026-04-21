package nodes

import (
	"bytes"
	"context"
	"crypto/ed25519"
	"crypto/rsa"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/ssh"
	"golang.org/x/crypto/ssh/knownhosts"
)

var (
	ErrInvalidSSHConfig = fmt.Errorf("invalid ssh config")
	ErrSSHProbeFailed   = fmt.Errorf("ssh probe failed")
)

type SSHRunner interface {
	Run(ctx context.Context, cfg SSHConfig, command string) (string, error)
}

type SSHProbe struct {
	runner SSHRunner
	now    func() time.Time
}

func NewSSHProbe() *SSHProbe {
	return &SSHProbe{
		runner: sshRunner{},
		now:    time.Now,
	}
}

func NewSSHProbeWithRunner(runner SSHRunner) *SSHProbe {
	return &SSHProbe{
		runner: runner,
		now:    time.Now,
	}
}

func (p *SSHProbe) Probe(ctx context.Context, cfg SSHConfig) (ProbeResult, error) {
	if p == nil || p.runner == nil {
		return ProbeResult{}, fmt.Errorf("%w: missing runner", ErrSSHProbeFailed)
	}

	cfg = cfg.normalize()
	if err := cfg.validate(); err != nil {
		return ProbeResult{}, err
	}

	result := ProbeResult{
		CheckedAt: p.now(),
	}

	hostname, err := p.runner.Run(ctx, cfg, "hostname")
	if err != nil {
		return result, fmt.Errorf("%w: hostname: %w", ErrSSHProbeFailed, err)
	}
	result.Inventory.Hostname = strings.TrimSpace(hostname)

	kernel, err := p.runner.Run(ctx, cfg, "uname -sr")
	if err != nil {
		return result, fmt.Errorf("%w: uname: %w", ErrSSHProbeFailed, err)
	}
	result.Inventory.Kernel = strings.TrimSpace(kernel)

	if uptime, err := p.runner.Run(ctx, cfg, "uptime -p"); err == nil {
		result.Inventory.Uptime = strings.TrimSpace(uptime)
	} else {
		result.Warnings = append(result.Warnings, fmt.Sprintf("uptime: %v", err))
	}

	if disk, err := p.runner.Run(ctx, cfg, "df -P /"); err == nil {
		result.Inventory.DiskSummary = summarizeDiskOutput(disk)
	} else {
		result.Warnings = append(result.Warnings, fmt.Sprintf("disk: %v", err))
	}

	if dockerVersion, err := p.runner.Run(ctx, cfg, "docker version --format '{{.Server.Version}}'"); err == nil {
		result.Inventory.DockerVersion = strings.TrimSpace(dockerVersion)
	} else {
		result.Warnings = append(result.Warnings, fmt.Sprintf("docker: %v", err))
	}

	result.Healthy = len(result.Warnings) == 0
	return result, nil
}

func (cfg SSHConfig) normalize() SSHConfig {
	if cfg.Port <= 0 {
		cfg.Port = 22
	}
	if cfg.Timeout <= 0 {
		cfg.Timeout = 10 * time.Second
	}
	return cfg
}

func (cfg SSHConfig) validate() error {
	if strings.TrimSpace(cfg.Host) == "" {
		return fmt.Errorf("%w: host is required", ErrInvalidSSHConfig)
	}
	if strings.TrimSpace(cfg.User) == "" {
		return fmt.Errorf("%w: user is required", ErrInvalidSSHConfig)
	}
	if strings.TrimSpace(cfg.PrivateKeyPath) == "" {
		return fmt.Errorf("%w: private key path is required", ErrInvalidSSHConfig)
	}
	if strings.TrimSpace(cfg.KnownHostsPath) == "" {
		return fmt.Errorf("%w: known hosts path is required", ErrInvalidSSHConfig)
	}
	return nil
}

type sshRunner struct{}

func (sshRunner) Run(ctx context.Context, cfg SSHConfig, command string) (string, error) {
	signer, err := loadSigner(expandPath(cfg.PrivateKeyPath))
	if err != nil {
		return "", err
	}

	callback, err := knownhosts.New(expandPath(cfg.KnownHostsPath))
	if err != nil {
		return "", err
	}

	sshCfg := &ssh.ClientConfig{
		User:            cfg.User,
		Auth:            []ssh.AuthMethod{ssh.PublicKeys(signer)},
		HostKeyCallback: callback,
		Timeout:         cfg.Timeout,
	}

	address := net.JoinHostPort(cfg.Host, strconv.Itoa(cfg.Port))
	dialer := &net.Dialer{Timeout: cfg.Timeout}
	conn, err := dialer.DialContext(ctx, "tcp", address)
	if err != nil {
		return "", err
	}
	defer conn.Close()

	clientConn, chans, reqs, err := ssh.NewClientConn(conn, address, sshCfg)
	if err != nil {
		return "", err
	}
	client := ssh.NewClient(clientConn, chans, reqs)
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return "", err
	}
	defer session.Close()

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	session.Stdout = &stdout
	session.Stderr = &stderr

	if err := session.Run(command); err != nil {
		if stderr.Len() > 0 {
			return "", fmt.Errorf("%w: %s", err, strings.TrimSpace(stderr.String()))
		}
		return "", err
	}

	return stdout.String(), nil
}

func loadSigner(path string) (ssh.Signer, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	signer, err := ssh.ParsePrivateKey(data)
	if err == nil {
		return signer, nil
	}

	if key, parseErr := ssh.ParseRawPrivateKey(data); parseErr == nil {
		switch k := key.(type) {
		case *rsa.PrivateKey:
			return ssh.NewSignerFromKey(k)
		case ed25519.PrivateKey:
			return ssh.NewSignerFromKey(k)
		}
	}

	return nil, err
}

func expandPath(path string) string {
	path = strings.TrimSpace(path)
	if path == "" || path[0] != '~' {
		return path
	}

	home, err := os.UserHomeDir()
	if err != nil {
		return path
	}

	if path == "~" {
		return home
	}

	if strings.HasPrefix(path, "~/") || strings.HasPrefix(path, "~\\") {
		return filepath.Join(home, path[2:])
	}

	return path
}

func summarizeDiskOutput(output string) string {
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) < 2 {
		return strings.TrimSpace(output)
	}
	fields := strings.Fields(lines[1])
	if len(fields) < 6 {
		return strings.TrimSpace(lines[1])
	}
	return strings.Join(fields[:6], " ")
}
