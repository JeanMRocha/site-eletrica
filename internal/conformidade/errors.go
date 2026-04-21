package conformidade

import "errors"

var (
	ErrInvalidPayload       = errors.New("invalid payload")
	ErrStandardResolution   = errors.New("standard resolution failed")
	ErrAssessmentIncomplete = errors.New("assessment incomplete")
)
