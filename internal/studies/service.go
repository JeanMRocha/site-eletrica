package studies

import (
	"context"

	"github.com/JeanMRocha/site-eletrica/internal/conformidade"
)

type Assessor interface {
	Assess(context.Context, conformidade.AssessmentInput) (conformidade.Verdict, error)
}

type Service struct {
	store    Repository
	assessor Assessor
}

func NewService(store Repository, assessor Assessor) *Service {
	return &Service{store: store, assessor: assessor}
}

func (s *Service) ListStudies(ctx context.Context) ([]Study, error) {
	return s.store.ListStudies(ctx)
}

func (s *Service) CreateStudy(ctx context.Context, input CreateStudyInput) (Study, error) {
	return s.store.CreateStudy(ctx, input)
}

func (s *Service) UpdateStudy(ctx context.Context, id string, input UpdateStudyInput) (Study, error) {
	return s.store.UpdateStudy(ctx, id, input)
}

func (s *Service) DeleteStudy(ctx context.Context, id string) error {
	return s.store.DeleteStudy(ctx, id)
}

func (s *Service) GetStudy(ctx context.Context, id string) (StudyDetail, error) {
	study, err := s.store.GetStudy(ctx, id)
	if err != nil {
		return StudyDetail{}, err
	}

	assessments, err := s.store.ListAssessments(ctx, id)
	if err != nil {
		return StudyDetail{}, err
	}

	return StudyDetail{
		Study:       study,
		Assessments: assessments,
	}, nil
}

func (s *Service) AssessStudy(ctx context.Context, studyID string, input conformidade.AssessmentInput) (AssessmentRecord, error) {
	if _, err := s.store.GetStudy(ctx, studyID); err != nil {
		return AssessmentRecord{}, err
	}

	input.StudyID = studyID
	verdict, err := s.assessor.Assess(ctx, input)
	if err != nil {
		return AssessmentRecord{}, err
	}

	return s.store.SaveAssessment(ctx, AssessmentRecord{
		StudyID: studyID,
		Input:   input,
		Verdict: verdict,
	})
}
