package validation

import (
	"net/mail"
	"strings"
)

func NormalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func IsValidEmail(email string) bool {
	email = strings.TrimSpace(email)
	_, err := mail.ParseAddress(email)
	return err == nil
}

func IsStrongEnoughPassword(pw string) bool {
	pw = strings.TrimSpace(pw)
	return len(pw) >= 8
}
