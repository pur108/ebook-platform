package postgres

import (
	"log"
	"os"

	"github.com/pur108/ebook-platform/backend/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewDB() *gorm.DB {

	dsn := os.Getenv("SUPABASE_URL")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Auto Migrate
	err = db.AutoMigrate(
		&domain.User{},
		&domain.Series{},
		&domain.Season{},
		&domain.Chapter{},
		&domain.ChapterImage{},
		&domain.TextLayer{},
		&domain.Translation{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	return db
}
