package engine

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"
)

// CromPayload represents the compressed structure
type CromPayload struct {
	Version    string            `json:"v"`
	Dictionary map[string]string `json:"d"` // Hash -> Original Content (for session-level deduplication)
	Content    string            `json:"c"` // Content with placeholders
	Metrics    CompressionMetrics `json:"m"`
}

type CompressionMetrics struct {
	OriginalSize   int     `json:"os"`
	CompressedSize int     `json:"cs"`
	Ratio          float64 `json:"r"`
}

// Compressor implements the DATA_INTELLIGENT_COMPRESSION skill
type Compressor struct {
	GlobalDict map[string]string // Known recurring strings (e.g., "NBR-5410", "Disjuntor Termomagnético")
}

func NewCompressor(globalDict map[string]string) *Compressor {
	return &Compressor{
		GlobalDict: globalDict,
	}
}

// Compress identifies patterns and returns a .crom structure
func (c *Compressor) Compress(input string) *CromPayload {
	originalSize := len(input)
	
	// Step 1: Semantic Deduplication (Global)
	processed := input
	sessionDict := make(map[string]string)

	for full, token := range c.GlobalDict {
		if strings.Contains(processed, full) {
			processed = strings.ReplaceAll(processed, full, "[[G:"+token+"]]")
		}
	}

	// Step 2: Intelligent Chunking (Basic JSON pattern detection)
	// We look for repeated long values or structural boilerplate
	// (Implementation simplified for MVP)
	
	compressedSize := len(processed)
	
	return &CromPayload{
		Version:    "1.0",
		Dictionary: sessionDict,
		Content:    processed,
		Metrics: CompressionMetrics{
			OriginalSize:   originalSize,
			CompressedSize: compressedSize,
			Ratio:          float64(compressedSize) / float64(originalSize) * 100,
		},
	}
}

func getHash(s string) string {
	h := sha256.New()
	h.Write([]byte(s))
	return hex.EncodeToString(h.Sum(nil))[:8]
}
