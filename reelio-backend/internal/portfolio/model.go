package portfolio

import (
	"time"

	"github.com/google/uuid"
)

type Entry struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	MediaURL    string    `gorm:"not null" json:"media_url"`
	CreatedAt   time.Time `gorm:"not null;default:now()" json:"created_at"`
}

func (Entry) TableName() string { return "portfolio" }
