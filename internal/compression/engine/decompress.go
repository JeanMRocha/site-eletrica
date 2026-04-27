package engine

import (
	"strings"
)

// Decompressor reconstructs the original content from a .crom payload
type Decompressor struct {
	GlobalDict map[string]string // Token -> Full string
}

func NewDecompressor(globalDict map[string]string) *Decompressor {
	// Revert the dictionary for lookup
	lookup := make(map[string]string)
	for full, token := range globalDict {
		lookup[token] = full
	}
	return &Decompressor{
		GlobalDict: lookup,
	}
}

func (d *Decompressor) Decompress(payload *CromPayload) string {
	result := payload.Content

	// Step 1: Resolve Global Tokens
	for token, full := range d.GlobalDict {
		placeholder := "[[G:" + token + "]]"
		if strings.Contains(result, placeholder) {
			result = strings.ReplaceAll(result, placeholder, full)
		}
	}

	// Step 2: Resolve Session Tokens (if any)
	for hash, full := range payload.Dictionary {
		placeholder := "[[S:" + hash + "]]"
		if strings.Contains(result, placeholder) {
			result = strings.ReplaceAll(result, placeholder, full)
		}
	}

	return result
}
