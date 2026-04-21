package studies

import "errors"

var (
	ErrStudyNotFound     = errors.New("study not found")
	ErrInvalidStudyInput = errors.New("invalid study input")
	ErrInvalidStudyState  = errors.New("invalid study state")
	ErrInvalidAssessment = errors.New("invalid assessment input")
)
