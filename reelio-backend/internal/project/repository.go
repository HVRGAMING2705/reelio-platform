package project

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, p *Project) error
	ListByUser(ctx context.Context, userID uuid.UUID) ([]Project, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Project, error)
	ListAll(ctx context.Context) ([]Project, error)
	Update(ctx context.Context, p *Project) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type repo struct{ db *gorm.DB }

func NewRepo(db *gorm.DB) Repository { return &repo{db: db} }

func (r *repo) Create(ctx context.Context, p *Project) error {
	return r.db.WithContext(ctx).Create(p).Error
}

func (r *repo) ListByUser(ctx context.Context, userID uuid.UUID) ([]Project, error) {
	var items []Project
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at desc").Find(&items).Error
	return items, err
}

func (r *repo) GetByID(ctx context.Context, id uuid.UUID) (*Project, error) {
	var p Project
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&p).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repo) ListAll(ctx context.Context) ([]Project, error) {
	var items []Project
	err := r.db.WithContext(ctx).Order("created_at desc").Find(&items).Error
	return items, err
}

func (r *repo) Update(ctx context.Context, p *Project) error {
	return r.db.WithContext(ctx).Save(p).Error
}

func (r *repo) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&Project{}, "id = ?", id).Error
}
