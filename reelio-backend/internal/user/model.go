package user

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleAdmin  Role = "admin"
	RoleClient Role = "client"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Role         Role      `gorm:"type:text;not null" json:"role"`
	CreatedAt    time.Time `gorm:"not null;default:now()" json:"created_at"`
}

func (User) TableName() string { return "users" }


func (u User) GetID() string { return u.ID.String() }
func (u User) GetName() string { return u.Name }
func (u User) GetEmail() string { return u.Email }
func (u User) GetRole() string { return string(u.Role) }
func (u User) GetCreatedAt() time.Time { return u.CreatedAt }
