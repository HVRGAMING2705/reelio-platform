package project

import (
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	StatusPending    Status = "pending"
	StatusInProgress Status = "in_progress"
	StatusCompleted  Status = "completed"
)

type Project struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Status      Status    `gorm:"type:text;not null" json:"status"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	CreatedAt   time.Time `gorm:"not null;default:now()" json:"created_at"`
}

func (Project) TableName() string { return "projects" }
