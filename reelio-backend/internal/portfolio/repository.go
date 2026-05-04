package portfolio

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, e *Entry) error
	List(ctx context.Context) ([]Entry, error)
	Get(ctx context.Context, id uuid.UUID) (*Entry, error)
	Update(ctx context.Context, e *Entry) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type repo struct{ db *gorm.DB }

func NewRepo(db *gorm.DB) Repository { return &repo{db: db} }

func (r *repo) Create(ctx context.Context, e *Entry) error {
	return r.db.WithContext(ctx).Create(e).Error
}

func (r *repo) List(ctx context.Context) ([]Entry, error) {
	var items []Entry
	err := r.db.WithContext(ctx).Order("created_at desc").Find(&items).Error
	return items, err
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Entry, error) {
	var e Entry
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&e).Error; err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *repo) Update(ctx context.Context, e *Entry) error {
	return r.db.WithContext(ctx).Save(e).Error
}

func (r *repo) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&Entry{}, "id = ?", id).Error
}
