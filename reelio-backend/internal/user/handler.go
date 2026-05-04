package user

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/reelio/platform/pkg/httpx"
	"gorm.io/gorm"
)

type Handler struct {
	repo Repository
}

func NewHandler(repo Repository) *Handler { return &Handler{repo: repo} }

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.repo.List(r.Context())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "failed")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"users": items})
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	u, err := h.repo.Get(r.Context(), id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			httpx.Error(w, http.StatusNotFound, "not found")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, "failed")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"user": u})
}
