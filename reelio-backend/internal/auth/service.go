package auth

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/reelio/platform/internal/user"
	"github.com/reelio/platform/pkg/validation"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailTaken         = errors.New("email already registered")
)

type Service struct {
	repo UserRepository
	jwt  *JWT
}

func NewService(repo UserRepository, jwt *JWT) *Service {
	return &Service{repo: repo, jwt: jwt}
}

type RegisterInput struct {
	Name     string
	Email    string
	Password string
}

type AuthOutput struct {
	User  user.User
	Token string
	Exp   time.Time
}

func (s *Service) Register(ctx context.Context, in RegisterInput) (*AuthOutput, error) {
	email := validation.NormalizeEmail(in.Email)
	if in.Name == "" || !validation.IsValidEmail(email) || !validation.IsStrongEnoughPassword(in.Password) {
		return nil, errors.New("invalid input")
	}

	// check existing
	_, err := s.repo.GetByEmail(ctx, email)
	if err == nil {
		return nil, ErrEmailTaken
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	u := user.User{
		ID:           uuid.New(),
		Name:         in.Name,
		Email:        email,
		PasswordHash: string(hash),
		Role:         user.RoleClient,
	}
	if err := s.repo.Create(ctx, &u); err != nil {
		return nil, err
	}

	tok, exp, err := s.jwt.Generate(u.ID, u.Role)
	if err != nil {
		return nil, err
	}
	return &AuthOutput{User: u, Token: tok, Exp: exp}, nil
}

type LoginInput struct {
	Email    string
	Password string
}

func (s *Service) Login(ctx context.Context, in LoginInput) (*AuthOutput, error) {
	email := validation.NormalizeEmail(in.Email)
	if !validation.IsValidEmail(email) || in.Password == "" {
		return nil, ErrInvalidCredentials
	}

	u, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(in.Password)) != nil {
		return nil, ErrInvalidCredentials
	}

	tok, exp, err := s.jwt.Generate(u.ID, u.Role)
	if err != nil {
		return nil, err
	}
	return &AuthOutput{User: *u, Token: tok, Exp: exp}, nil
}

func (s *Service) Me(ctx context.Context, userID string) (*user.User, error) {
	return s.repo.GetByID(ctx, userID)
}
