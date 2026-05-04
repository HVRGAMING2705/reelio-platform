package db

import (
	"context"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DB struct {
	Gorm *gorm.DB
}

func Connect(dsn string, isProd bool) (*DB, error) {
	lvl := logger.Info
	if isProd {
		lvl = logger.Warn
	}
	gdb, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(lvl),
	})
	if err != nil {
		return nil, err
	}

	sqldb, err := gdb.DB()
	if err != nil {
		return nil, err
	}
	sqldb.SetMaxOpenConns(25)
	sqldb.SetMaxIdleConns(10)
	sqldb.SetConnMaxLifetime(30 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := sqldb.PingContext(ctx); err != nil {
		return nil, err
	}

	return &DB{Gorm: gdb}, nil
}
