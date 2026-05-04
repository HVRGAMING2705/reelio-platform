package user

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	List(ctx context.Context) ([]User, error)
	Get(ctx context.Context, id uuid.UUID) (*User, error)
}

type repo struct{ db *gorm.DB }

func NewRepo(db *gorm.DB) Repository { return &repo{db: db} }

func (r *repo) List(ctx context.Context) ([]User, error) {
	var items []User
	err := r.db.WithContext(ctx).Order("created_at desc").Find(&items).Error
	return items, err
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*User, error) {
	var u User
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}
