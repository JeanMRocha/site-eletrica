package adapters

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/JeanMRocha/site-eletrica/internal/compression/dictionary"
	"github.com/JeanMRocha/site-eletrica/internal/compression/engine"
)

// CompressionMiddleware automatically compresses responses > 1KB
func CompressionMiddleware(next http.Handler) http.Handler {
	comp := engine.NewCompressor(dictionary.DefaultTechnicalDict)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only compress JSON responses
		if r.Header.Get("Accept") != "application/x-crom" {
			next.ServeHTTP(w, r)
			return
		}

		// Capture the output
		rec := &responseRecorder{ResponseWriter: w, body: &bytes.Buffer{}}
		next.ServeHTTP(rec, r)

		if rec.body.Len() > 1024 {
			payload := comp.Compress(rec.body.String())
			w.Header().Set("Content-Type", "application/x-crom")
			json.NewEncoder(w).Encode(payload)
		} else {
			io.Copy(w, rec.body)
		}
	})
}

type responseRecorder struct {
	http.ResponseWriter
	body *bytes.Buffer
}

func (r *responseRecorder) Write(b []byte) (int, error) {
	return r.body.Write(b)
}
