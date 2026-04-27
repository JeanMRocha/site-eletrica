package adapters

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/JeanMRocha/site-eletrica/internal/compression/dictionary"
	"github.com/JeanMRocha/site-eletrica/internal/compression/engine"
)

type responseRecorder struct {
	http.ResponseWriter
	body       *bytes.Buffer
	statusCode int
}

func (r *responseRecorder) WriteHeader(statusCode int) {
	r.statusCode = statusCode
}

func (r *responseRecorder) Write(b []byte) (int, error) {
	return r.body.Write(b)
}

// CompressionMiddleware automatically compresses responses > 1KB
func CompressionMiddleware(next http.Handler) http.Handler {
	comp := engine.NewCompressor(dictionary.DefaultTechnicalDict)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Capture the output
		rec := &responseRecorder{ResponseWriter: w, body: &bytes.Buffer{}, statusCode: http.StatusOK}
		next.ServeHTTP(rec, r)

		// Only compress JSON responses and if client accepts it
		if rec.body.Len() > 1024 && r.Header.Get("Accept") == "application/x-crom" {
			payload := comp.Compress(rec.body.String())
			w.Header().Set("Content-Type", "application/x-crom")
			w.WriteHeader(rec.statusCode)
			json.NewEncoder(w).Encode(payload)
		} else {
			w.WriteHeader(rec.statusCode)
			io.Copy(w, rec.body)
		}
	})
}
