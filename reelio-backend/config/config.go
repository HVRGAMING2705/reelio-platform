package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type CookieSameSite string

const (
	CookieSameSiteLax    CookieSameSite = "lax"
	CookieSameSiteStrict CookieSameSite = "strict"
	CookieSameSiteNone   CookieSameSite = "none"
)

type Config struct {
	Env           string
	Addr          string
	PublicBaseURL string

	DBDSN string

	JWTSecret     string
	JWTIssuer     string
	JWTTTL        time.Duration
	AuthCookieName     string
	AuthCookieSecure   bool
	AuthCookieSameSite CookieSameSite

	CORSAllowedOrigins   []string
	CORSAllowedHeaders   []string
	CORSAllowedMethods   []string
	CORSAllowCredentials bool

	RateLimitRPS   float64
	RateLimitBurst int
}

func Load() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{}
	cfg.Env = getenv("APP_ENV", "development")
	cfg.Addr = getenv("APP_ADDR", ":8080")
	cfg.PublicBaseURL = getenv("APP_PUBLIC_BASE_URL", "http://localhost:8080")
	cfg.DBDSN = getenv("DB_DSN", "")
	if cfg.DBDSN == "" {
		return Config{}, fmt.Errorf("DB_DSN is required")
	}

	cfg.JWTSecret = getenv("JWT_SECRET", "")
	if cfg.JWTSecret == "" {
		return Config{}, fmt.Errorf("JWT_SECRET is required")
	}
	cfg.JWTIssuer = getenv("JWT_ISSUER", "reelio")
	ttlMin, err := strconv.Atoi(getenv("JWT_TTL_MINUTES", "60"))
	if err != nil || ttlMin <= 0 {
		return Config{}, fmt.Errorf("JWT_TTL_MINUTES must be a positive integer")
	}
	cfg.JWTTTL = time.Duration(ttlMin) * time.Minute

	cfg.AuthCookieName = getenv("AUTH_COOKIE_NAME", "reelio_auth")
	cfg.AuthCookieSecure = getenvBool("AUTH_COOKIE_SECURE", false)
	cfg.AuthCookieSameSite = CookieSameSite(strings.ToLower(getenv("AUTH_COOKIE_SAMESITE", "lax")))
	if cfg.AuthCookieSameSite != CookieSameSiteLax && cfg.AuthCookieSameSite != CookieSameSiteStrict && cfg.AuthCookieSameSite != CookieSameSiteNone {
		return Config{}, fmt.Errorf("AUTH_COOKIE_SAMESITE must be one of: lax, strict, none")
	}

	cfg.CORSAllowedOrigins = splitCSV(getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"))
	cfg.CORSAllowedHeaders = splitCSV(getenv("CORS_ALLOWED_HEADERS", "Accept,Authorization,Content-Type"))
	cfg.CORSAllowedMethods = splitCSV(getenv("CORS_ALLOWED_METHODS", "GET,POST,PUT,PATCH,DELETE,OPTIONS"))	
	cfg.CORSAllowCredentials = getenvBool("CORS_ALLOW_CREDENTIALS", true)

	rps, err := strconv.ParseFloat(getenv("RATE_LIMIT_RPS", "5"), 64)
	if err != nil || rps <= 0 {
		return Config{}, fmt.Errorf("RATE_LIMIT_RPS must be a positive number")
	}
	cfg.RateLimitRPS = rps

	burst, err := strconv.Atoi(getenv("RATE_LIMIT_BURST", "10"))
	if err != nil || burst <= 0 {
		return Config{}, fmt.Errorf("RATE_LIMIT_BURST must be a positive integer")
	}
	cfg.RateLimitBurst = burst

	return cfg, nil
}

func getenv(key, def string) string {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return def
	}
	return v
}

func getenvBool(key string, def bool) bool {
	v := strings.ToLower(strings.TrimSpace(os.Getenv(key)))
	if v == "" {
		return def
	}
	switch v {
	case "true", "1", "yes", "y", "on":
		return true
	case "false", "0", "no", "n", "off":
		return false
	default:
		return def
	}
}

func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
