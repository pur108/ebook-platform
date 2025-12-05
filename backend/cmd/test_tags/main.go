package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/pur108/ebook-platform/backend/internal/domain"
	postgres "github.com/pur108/ebook-platform/backend/internal/repository/supabase"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	defer func() {
		if r := recover(); r != nil {
			os.WriteFile("test_panic.txt", []byte(fmt.Sprintf("%v", r)), 0644)
		}
	}()

	db := postgres.NewDB()

	tagID := uuid.New()
	tag := domain.Tag{
		ID:        tagID,
		Slug:      "test-tag-" + tagID.String(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Translations: []domain.TagTranslation{
			{
				ID:       uuid.New(),
				TagID:    tagID,
				Language: "en",
				Name:     "Test Tag",
			},
		},
	}

	fmt.Println("Attempting to create tag...")
	if err := db.Create(&tag).Error; err != nil {
		os.WriteFile("test_error.txt", []byte(err.Error()), 0644)
		return
	}

	fmt.Println("Successfully created tag!")
	os.WriteFile("test_success.txt", []byte("SUCCESS"), 0644)
}
