package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/reelio/platform/internal/auth"
	"github.com/reelio/platform/internal/user"
	"github.com/reelio/platform/pkg/httpx"
)

const (
	ctxUserID = "user_id"
	ctxRole   = "role"
)

func UserIDFromContext(ctx context.Context) string {
	v, _ := ctx.Value(ctxUserID).(string)
	return v
}

func RoleFromContext(ctx context.Context) user.Role {
	v, _ := ctx.Value(ctxRole).(user.Role)
	return v
}

type AuthMiddleware struct {
	jwt        *auth.JWT
	cookieName string
}

func NewAuthMiddleware(jwt *auth.JWT, cookieName string) *AuthMiddleware {
	return &AuthMiddleware{jwt: jwt, cookieName: cookieName}
}

func (m *AuthMiddleware) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenStr := ""

		// Cookie auth
		if c, err := r.Cookie(m.cookieName); err == nil {
			tokenStr = c.Value
		}

		// Allow Authorization header as fallback
		if tokenStr == "" {
			authz := r.Header.Get("Authorization")
			if strings.HasPrefix(strings.ToLower(authz), "bearer ") {
				tokenStr = strings.TrimSpace(authz[7:])
			}
		}

		if tokenStr == "" {
			httpx.Error(w, http.StatusUnauthorized, "unauthorized")
			return
		}

		claims, err := m.jwt.Parse(tokenStr)
		if err != nil {
			httpx.Error(w, http.StatusUnauthorized, "unauthorized")
			return
		}

		ctx := context.WithValue(r.Context(), ctxUserID, claims.UserID)
		ctx = context.WithValue(ctx, ctxRole, claims.Role)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
