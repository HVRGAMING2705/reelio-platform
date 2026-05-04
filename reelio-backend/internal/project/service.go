package project

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrNotFound  = errors.New("not found")
	ErrForbidden = errors.New("forbidden")
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service { return &Service{repo: repo} }

type CreateInput struct {
	Title       string
	Description string
	UserID      uuid.UUID
}

func (s *Service) Create(ctx context.Context, in CreateInput) (*Project, error) {
	p := Project{
		ID:          uuid.New(),
		Title:       in.Title,
		Description: in.Description,
		Status:      StatusPending,
		UserID:      in.UserID,
	}
	if err := s.repo.Create(ctx, &p); err != nil {
		return nil, err
	}
	return &p, nil
}

func (s *Service) ListForUser(ctx context.Context, userID uuid.UUID) ([]Project, error) {
	return s.repo.ListByUser(ctx, userID)
}

func (s *Service) ListAll(ctx context.Context) ([]Project, error) {
	return s.repo.ListAll(ctx)
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (*Project, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return p, nil
}

type UpdateInput struct {
	ID          uuid.UUID
	Title       *string
	Description *string
	Status      *Status
	UserID      *uuid.UUID
}

func (s *Service) Update(ctx context.Context, in UpdateInput) (*Project, error) {
	p, err := s.Get(ctx, in.ID)
	if err != nil {
		return nil, err
	}
	if in.Title != nil {
		p.Title = *in.Title
	}
	if in.Description != nil {
		p.Description = *in.Description
	}
	if in.Status != nil {
		p.Status = *in.Status
	}
	if in.UserID != nil {
		p.UserID = *in.UserID
	}
	if err := s.repo.Update(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	if _, err := s.Get(ctx, id); err != nil {
		return err
	}
	return s.repo.Delete(ctx, id)
}
