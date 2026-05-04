package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/reelio/platform/pkg/httpx"
	"golang.org/x/time/rate"
)

type entry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type RateLimiter struct {
	rps   rate.Limit
	burst int

	mu sync.Mutex
	m  map[string]*entry
}

func NewRateLimiter(rps float64, burst int) *RateLimiter {
	rl := &RateLimiter{
		rps:   rate.Limit(rps),
		burst: burst,
		m:     map[string]*entry{},
	}
	// FIX: single background goroutine sweeps stale entries every minute
	// instead of one goroutine per IP (which leaked memory indefinitely)
	go rl.cleanupLoop()
	return rl
}

func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		for ip, e := range rl.m {
			if time.Since(e.lastSeen) > 30*time.Minute {
				delete(rl.m, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			ip = r.RemoteAddr
		}
		lim := rl.get(ip)
		if !lim.Allow() {
			httpx.Error(w, http.StatusTooManyRequests, "rate limit exceeded")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (rl *RateLimiter) get(key string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	e, ok := rl.m[key]
	if ok {
		e.lastSeen = time.Now()
		return e.limiter
	}
	lim := rate.NewLimiter(rl.rps, rl.burst)
	rl.m[key] = &entry{limiter: lim, lastSeen: time.Now()}
	return lim
}