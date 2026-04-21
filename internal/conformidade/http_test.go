package conformidade

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/JeanMRocha/site-eletrica/internal/standards"
)

func TestAssessHTTP(t *testing.T) {
	handler := NewHandler(NewService(standards.NewInMemoryService(standards.DefaultCatalog())))

	body, _ := json.Marshal(AssessmentInput{
		StudyID:            "ST-1",
		CircuitID:          "C1",
		CurrentProjectA:    17.3,
		ConductorMM2:       2.5,
		BreakerA:           20,
		VoltageDropPercent: 3.1,
		StandardCode:       "NBR-5410",
	})

	req := httptest.NewRequest(http.MethodPost, "/v1/conformidade/assess", bytes.NewReader(body))
	resp := httptest.NewRecorder()
	handler.Routes().ServeHTTP(resp, req)

	if resp.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.Code)
	}
}
