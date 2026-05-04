package project

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/reelio/platform/internal/middleware"
	"github.com/reelio/platform/internal/user"
	"github.com/reelio/platform/pkg/httpx"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

type createRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	uidStr := middleware.UserIDFromContext(r.Context())
	uid, err := uuid.Parse(uidStr)
	if err != nil {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	var req createRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Title == "" {
		httpx.Error(w, http.StatusBadRequest, "title is required")
		return
	}
	p, err := h.svc.Create(r.Context(), CreateInput{Title: req.Title, Description: req.Description, UserID: uid})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "failed to create")
		return
	}
	httpx.JSON(w, http.StatusCreated, map[string]any{"project": p})
}

func (h *Handler) ListMine(w http.ResponseWriter, r *http.Request) {
	uidStr := middleware.UserIDFromContext(r.Context())
	uid, err := uuid.Parse(uidStr)
	if err != nil {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	items, err := h.svc.ListForUser(r.Context(), uid)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "failed to list")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"projects": items})
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	p, err := h.svc.Get(r.Context(), id)
	if err != nil {
		if err == ErrNotFound {
			httpx.Error(w, http.StatusNotFound, "not found")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, "failed")
		return
	}
	// enforce ownership for clients
	role := middleware.RoleFromContext(r.Context())
	if role == user.RoleClient {
		uidStr := middleware.UserIDFromContext(r.Context())
		if p.UserID.String() != uidStr {
			httpx.Error(w, http.StatusForbidden, "forbidden")
			return
		}
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"project": p})
}

type updateRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Status      *Status `json:"status"`
	UserID      *string `json:"user_id"`
}

func (h *Handler) AdminListAll(w http.ResponseWriter, r *http.Request) {
	items, err := h.svc.ListAll(r.Context())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "failed to list")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"projects": items})
}

func (h *Handler) AdminUpdate(w http.ResponseWriter, r *http.Request) {
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
	var userID *uuid.UUID
	if req.UserID != nil {
		u, err := uuid.Parse(*req.UserID)
		if err != nil {
			httpx.Error(w, http.StatusBadRequest, "invalid user_id")
			return
		}
		userID = &u
	}
	p, err := h.svc.Update(r.Context(), UpdateInput{ID: id, Title: req.Title, Description: req.Description, Status: req.Status, UserID: userID})
	if err != nil {
		if err == ErrNotFound {
			httpx.Error(w, http.StatusNotFound, "not found")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, "failed")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"project": p})
}

func (h *Handler) AdminDelete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.svc.Delete(r.Context(), id); err != nil {
		if err == ErrNotFound {
			httpx.Error(w, http.StatusNotFound, "not found")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, "failed")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"ok": true})
}
