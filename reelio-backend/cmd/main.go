package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"

	"github.com/reelio/platform/config"
	"github.com/reelio/platform/internal/auth"
	appmw "github.com/reelio/platform/internal/middleware"
	"github.com/reelio/platform/internal/portfolio"
	"github.com/reelio/platform/internal/project"
	"github.com/reelio/platform/internal/user"
	"github.com/reelio/platform/pkg/db"
	"github.com/reelio/platform/pkg/httpx"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	dbConn, err := db.Connect(cfg.DBDSN, cfg.Env == "production")
	if err != nil {
		log.Fatal(err)
	}

	jwt := auth.NewJWT(cfg.JWTSecret, cfg.JWTIssuer, cfg.JWTTTL)

	authMW := appmw.NewAuthMiddleware(jwt, cfg.AuthCookieName)
	rl := appmw.NewRateLimiter(cfg.RateLimitRPS, cfg.RateLimitBurst)

	// wiring
	authRepo := auth.NewUserRepo(dbConn.Gorm)
	authSvc := auth.NewService(authRepo, jwt)
	authHandler := auth.NewHandler(authSvc, cfg)

	userRepo := user.NewRepo(dbConn.Gorm)
	userHandler := user.NewHandler(userRepo)

	projRepo := project.NewRepo(dbConn.Gorm)
	projSvc := project.NewService(projRepo)
	projHandler := project.NewHandler(projSvc)

	portRepo := portfolio.NewRepo(dbConn.Gorm)
	portSvc := portfolio.NewService(portRepo)
	portHandler := portfolio.NewHandler(portSvc)

	r := chi.NewRouter()

	// middleware
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Timeout(30 * time.Second))
	r.Use(chimw.Logger)

	r.Use(appmw.CORS(appmw.CORSConfig{
		AllowedOrigins:   cfg.CORSAllowedOrigins,
		AllowedMethods:   cfg.CORSAllowedMethods,
		AllowedHeaders:   cfg.CORSAllowedHeaders,
		AllowCredentials: cfg.CORSAllowCredentials,
	}))

	// health
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		httpx.JSON(w, http.StatusOK, map[string]any{"ok": true})
	})

	r.Route("/api", func(api chi.Router) {

		// ================= AUTH =================
		api.Route("/auth", func(ar chi.Router) {
			ar.With(rl.Middleware).Post("/register", authHandler.Register)
			ar.With(rl.Middleware).Post("/login", authHandler.Login)

			ar.With(authMW.RequireAuth).Get("/me", authHandler.Me)
			ar.With(authMW.RequireAuth).Post("/logout", authHandler.Logout)
		})

		// ================= PUBLIC =================
		api.Get("/portfolio", portHandler.List)
		api.Get("/portfolio/{id}", portHandler.Get)

		// ================= AUTHENTICATED =================
		api.Group(func(pr chi.Router) {
			pr.Use(authMW.RequireAuth)

			// ---------- PROJECTS ----------
			pr.Post("/projects", projHandler.Create)
			pr.Get("/projects", projHandler.ListMine)
			pr.Get("/projects/{id}", projHandler.Get)

			// ---------- USER PORTFOLIO ----------
			pr.Get("/portfolio/mine", portHandler.ListMine)
			pr.Post("/portfolio", portHandler.Create)
			pr.Patch("/portfolio/{id}", portHandler.UpdateMine)
			pr.Delete("/portfolio/{id}", portHandler.DeleteMine)

			// ================= ADMIN =================
			pr.Group(func(ad chi.Router) {
				ad.Use(appmw.RequireRole(user.RoleAdmin))

				ad.Get("/users", userHandler.List)
				ad.Get("/users/{id}", userHandler.Get)

				ad.Get("/admin/projects", projHandler.AdminListAll)
				ad.Patch("/projects/{id}", projHandler.AdminUpdate)
				ad.Delete("/projects/{id}", projHandler.AdminDelete)

				ad.Post("/admin/portfolio", portHandler.AdminCreate)
				ad.Patch("/admin/portfolio/{id}", portHandler.AdminUpdate)
				ad.Delete("/admin/portfolio/{id}", portHandler.AdminDelete)
			})
		})
	})

	srv := &http.Server{
		Addr:              cfg.Addr,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
	}

	log.Printf("API running on %s", cfg.Addr)
	log.Fatal(srv.ListenAndServe())
}