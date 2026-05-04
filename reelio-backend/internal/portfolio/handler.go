package portfolio

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/reelio/platform/pkg/httpx"
)

type Handler struct {
	svc *Service
}

func NewHandler(s *Service) *Handler {
	return &Handler{svc: s}
}

// ===== REQUEST STRUCTS =====

type createRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	MediaURL    string `json:"media_url"`
}

type updateRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	MediaURL    string `json:"media_url"`
}

// ===== CREATE =====

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Title == "" || req.MediaURL == "" {
		httpx.Error(w, http.StatusBadRequest, "title and media_url required")
		return
	}

	e, err := h.svc.Create(r.Context(), CreateInput{
		Title:       req.Title,
		Description: req.Description,
		MediaURL:    req.MediaURL,
	})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "failed")
		return
	}

	httpx.JSON(w, http.StatusCreated, map[string]any{"entry": e})
}

// ===== LIST =====

func (h *Handler) ListMine(w http.ResponseWriter, r *http.Request) {
	items, err := h.svc.List(r.Context())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "failed")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"portfolio": items})
}

// Public alias
func (h *Handler) List(w http.ResponseWriter, r *http.Request) { h.ListMine(w, r) }

// ===== UPDATE =====

func (h *Handler) UpdateMine(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}

	var req updateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid json")
		return
	}

	e, err := h.svc.Update(r.Context(), UpdateInput{
		ID:          id,
		Title:       req.Title,
		Description: req.Description,
		MediaURL:    req.MediaURL,
	})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "failed")
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]any{"entry": e})
}

// ===== GET =====

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}

	e, err := h.svc.Get(r.Context(), id)
	if err != nil {
		httpx.Error(w, http.StatusNotFound, "not found")
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]any{"entry": e})
}

// ===== DELETE =====

func (h *Handler) DeleteMine(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.Delete(r.Context(), id); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "failed")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"ok": true})
}

// ===== ADMIN (ALIASES) =====

func (h *Handler) AdminCreate(w http.ResponseWriter, r *http.Request) { h.Create(w, r) }
func (h *Handler) AdminUpdate(w http.ResponseWriter, r *http.Request) { h.UpdateMine(w, r) }
func (h *Handler) AdminDelete(w http.ResponseWriter, r *http.Request) { h.DeleteMine(w, r) }
