package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/reelio/platform/internal/user"
)

type Claims struct {
	UserID string    `json:"uid"`
	Role   user.Role `json:"role"`
	jwt.RegisteredClaims
}

type JWT struct {
	secret []byte
	issuer string
	ttl    time.Duration
}

func NewJWT(secret, issuer string, ttl time.Duration) *JWT {
	return &JWT{secret: []byte(secret), issuer: issuer, ttl: ttl}
}

func (j *JWT) Generate(userID uuid.UUID, role user.Role) (string, time.Time, error) {
	exp := time.Now().Add(j.ttl)
	claims := Claims{
		UserID: userID.String(),
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    j.issuer,
			Subject:   userID.String(),
			ExpiresAt: jwt.NewNumericDate(exp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := tok.SignedString(j.secret)
	return signed, exp, err
}

func (j *JWT) Parse(tokenStr string) (*Claims, error) {
	parser := jwt.NewParser(jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	tok, err := parser.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (any, error) {
		return j.secret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := tok.Claims.(*Claims)
	if !ok || !tok.Valid {
		return nil, errors.New("invalid token")
	}
	if claims.Issuer != j.issuer {
		return nil, errors.New("invalid token issuer")
	}
	return claims, nil
}
