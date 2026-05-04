package middleware

import (
	"net/http"

	"github.com/reelio/platform/internal/user"
	"github.com/reelio/platform/pkg/httpx"
)

func RequireRole(roles ...user.Role) func(http.Handler) http.Handler {
	allowed := map[user.Role]bool{}
	for _, r := range roles {
		allowed[r] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role := RoleFromContext(r.Context())
			if role == "" || !allowed[role] {
				httpx.Error(w, http.StatusForbidden, "forbidden")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
