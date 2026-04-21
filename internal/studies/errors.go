package studies

import "errors"

var (
	ErrStudyNotFound     = errors.New("study not found")
	ErrInvalidStudyInput = errors.New("invalid study input")
	ErrInvalidAssessment = errors.New("invalid assessment input")
)
