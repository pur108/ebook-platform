package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	postgres "github.com/pur108/ebook-platform/backend/internal/repository/supabase"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}
	db := postgres.NewDB()

	// Delete all users
	if err := db.Exec("DELETE FROM users").Error; err != nil {
		os.WriteFile("reset_error.txt", []byte(err.Error()), 0644)
		log.Fatal(err)
	}
	os.WriteFile("reset_success.txt", []byte("success"), 0644)
	log.Println("All users deleted")
}
