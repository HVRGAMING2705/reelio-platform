package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/reelio/platform/config"
	"github.com/reelio/platform/internal/user"
	"github.com/reelio/platform/pkg/httpx"
)

// ctxKeyUserID matches the key used in internal/middleware/auth.go.
// Duplicated here to avoid an import cycle: auth -> middleware -> auth.
const ctxKeyUserID = "user_id"

func userIDFromContext(ctx context.Context) string {
	v, _ := ctx.Value(ctxKeyUserID).(string)
	return v
}

type Handler struct {
	svc *Service
	cfg config.Config
}

func NewHandler(svc *Service, cfg config.Config) *Handler {
	return &Handler{svc: svc, cfg: cfg}
}

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type userResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	CreatedAt string `json:"created_at"`
}

type authResponse struct {
	User userResponse `json:"user"`
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid json")
		return
	}

	out, err := h.svc.Register(r.Context(), RegisterInput{Name: req.Name, Email: req.Email, Password: req.Password})
	if err != nil {
		switch err {
		case ErrEmailTaken:
			httpx.Error(w, http.StatusConflict, err.Error())
		default:
			httpx.Error(w, http.StatusBadRequest, err.Error())
		}
		return
	}

	h.setAuthCookie(w, out.Token, out.Exp)
	httpx.JSON(w, http.StatusCreated, authResponse{User: toUserResponse(out.User)})
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid json")
		return
	}

	out, err := h.svc.Login(r.Context(), LoginInput{Email: req.Email, Password: req.Password})
	if err != nil {
		httpx.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	h.setAuthCookie(w, out.Token, out.Exp)
	httpx.JSON(w, http.StatusOK, authResponse{User: toUserResponse(out.User)})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	// FIX: use local helper to avoid import cycle (auth <-> middleware)
	uid := userIDFromContext(r.Context())
	if uid == "" {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	u, err := h.svc.Me(r.Context(), uid)
	if err != nil {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	httpx.JSON(w, http.StatusOK, authResponse{User: toUserResponse(*u)})
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie := &http.Cookie{
		Name:     h.cfg.AuthCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	}
	if h.cfg.AuthCookieSecure {
		cookie.Secure = true
	}
	switch h.cfg.AuthCookieSameSite {
	case config.CookieSameSiteStrict:
		cookie.SameSite = http.SameSiteStrictMode
	case config.CookieSameSiteNone:
		cookie.SameSite = http.SameSiteNoneMode
	default:
		cookie.SameSite = http.SameSiteLaxMode
	}
	http.SetCookie(w, cookie)
	httpx.JSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (h *Handler) setAuthCookie(w http.ResponseWriter, token string, exp time.Time) {
	cookie := &http.Cookie{
		Name:     h.cfg.AuthCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Expires:  exp,
	}
	if h.cfg.AuthCookieSecure {
		cookie.Secure = true
	}
	switch h.cfg.AuthCookieSameSite {
	case config.CookieSameSiteStrict:
		cookie.SameSite = http.SameSiteStrictMode
	case config.CookieSameSiteNone:
		cookie.SameSite = http.SameSiteNoneMode
	default:
		cookie.SameSite = http.SameSiteLaxMode
	}
	http.SetCookie(w, cookie)
}

// FIX: accept user.User directly — no unsafe interface assertion
func toUserResponse(u user.User) userResponse {
	return userResponse{
		ID:        u.GetID(),
		Name:      u.GetName(),
		Email:     u.GetEmail(),
		Role:      u.GetRole(),
		CreatedAt: u.GetCreatedAt().UTC().Format(time.RFC3339),
	}
}