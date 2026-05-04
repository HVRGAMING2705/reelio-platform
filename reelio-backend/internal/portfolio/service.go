package portfolio

import (
	"context"

	"github.com/google/uuid"
)

type Service struct {
	repo Repository
}

func NewService(r Repository) *Service {
	return &Service{repo: r}
}

// ===== INPUT STRUCTS (NO POINTERS) =====
type CreateInput struct {
	Title       string
	Description string
	MediaURL    string
}

type UpdateInput struct {
	ID          uuid.UUID
	Title       string
	Description string
	MediaURL    string
}

// ===== METHODS =====
func (s *Service) Create(ctx context.Context, in CreateInput) (*Entry, error) {
	e := &Entry{
		Title:       in.Title,
		Description: in.Description,
		MediaURL:    in.MediaURL,
	}
	if err := s.repo.Create(ctx, e); err != nil {
		return nil, err
	}
	return e, nil
}

func (s *Service) List(ctx context.Context) ([]Entry, error) {
	return s.repo.List(ctx)
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (*Entry, error) {
	return s.repo.Get(ctx, id)
}

func (s *Service) Update(ctx context.Context, in UpdateInput) (*Entry, error) {
	e, err := s.repo.Get(ctx, in.ID)
	if err != nil {
		return nil, err
	}
	e.Title = in.Title
	e.Description = in.Description
	e.MediaURL = in.MediaURL

	if err := s.repo.Update(ctx, e); err != nil {
		return nil, err
	}
	return e, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
