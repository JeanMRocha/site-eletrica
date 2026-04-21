package nodes

import "time"

type Status string

const (
	StatusHealthy     Status = "healthy"
	StatusDegraded    Status = "degraded"
	StatusUnreachable Status = "unreachable"
)

type Role string

const (
	RolePrimary  Role = "primary"
	RoleMonitor  Role = "monitor"
	RoleSupport  Role = "support"
	RoleExternal Role = "external"
)

type SSHConfig struct {
	Host           string
	Port           int
	User           string
	PrivateKeyPath string
	KnownHostsPath string
	Timeout        time.Duration
}

type Inventory struct {
	Provider      string `json:"provider,omitempty"`
	Region        string `json:"region,omitempty"`
	OS            string `json:"os,omitempty"`
	Plan          string `json:"plan,omitempty"`
	CPUCores      int    `json:"cpuCores,omitempty"`
	MemoryGB      int    `json:"memoryGB,omitempty"`
	DiskGB        int    `json:"diskGB,omitempty"`
	AutoRenewal   bool   `json:"autoRenewal,omitempty"`
	RenewalDate   string `json:"renewalDate,omitempty"`
	SSHUser       string `json:"sshUser,omitempty"`
	IPv4          string `json:"ipv4,omitempty"`
	Hostname      string `json:"hostname,omitempty"`
	Kernel        string `json:"kernel,omitempty"`
	Uptime        string `json:"uptime,omitempty"`
	DockerVersion string `json:"dockerVersion,omitempty"`
	DiskSummary   string `json:"diskSummary,omitempty"`
}

type ProbeResult struct {
	CheckedAt time.Time `json:"checkedAt"`
	Healthy   bool      `json:"healthy"`
	Warnings  []string  `json:"warnings,omitempty"`
	Inventory Inventory `json:"inventory"`
}

type Node struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Role        Role       `json:"role"`
	Host        string     `json:"host"`
	Port        int        `json:"port"`
	User        string     `json:"user"`
	Status      Status     `json:"status"`
	LastSeenAt  *time.Time `json:"lastSeenAt,omitempty"`
	LastProbeAt *time.Time `json:"lastProbeAt,omitempty"`
	Inventory   Inventory  `json:"inventory"`
}

func NewPrimaryNode() Node {
	return Node{
		ID:     "node_primary_vps",
		Name:   "Primary VPS",
		Role:   RolePrimary,
		Host:   "78.142.242.236",
		Port:   22,
		User:   "root",
		Status: StatusHealthy,
		Inventory: Inventory{
			Provider:    "Hostinger",
			Region:      "Brazil, Sao Paulo",
			OS:          "Ubuntu 24.04 with Coolify",
			Plan:        "KVM 2",
			CPUCores:    2,
			MemoryGB:    8,
			DiskGB:      100,
			AutoRenewal: true,
			RenewalDate: "2027-06-05",
			SSHUser:     "root",
			IPv4:        "78.142.242.236",
			Hostname:    "srv856573.hstgr.cloud",
		},
	}
}
