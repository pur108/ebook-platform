package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	httpDelivery "github.com/pur108/ebook-platform/backend/internal/delivery/http"
	postgres "github.com/pur108/ebook-platform/backend/internal/repository/supabase"
	"github.com/pur108/ebook-platform/backend/internal/usecase"
)

func main() {
	os.WriteFile("server_status.txt", []byte("Server started\n"), 0644)
	fmt.Println("Starting server...")
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize Database
	db := postgres.NewDB()

	// Initialize Fiber
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// Repositories
	userRepo := postgres.NewUserRepository(db)
	comicRepo := postgres.NewComicRepository(db)
	layerRepo := postgres.NewLayerRepository(db)

	// Usecases
	authUsecase := usecase.NewAuthUsecase(userRepo)
	userUsecase := usecase.NewUserUsecase(userRepo)
	comicUsecase := usecase.NewComicUsecase(comicRepo)
	layerUsecase := usecase.NewLayerUsecase(layerRepo)
	adminUsecase := usecase.NewAdminUsecase(userRepo)

	// Handlers
	httpDelivery.NewAuthHandler(app, authUsecase)
	httpDelivery.NewUserHandler(app, userUsecase)
	httpDelivery.NewComicHandler(app, comicUsecase)
	httpDelivery.NewLayerHandler(app, layerUsecase)
	httpDelivery.NewAdminHandler(app, adminUsecase)
	httpDelivery.NewUploadHandler(app)

	// Static files
	app.Static("/uploads", "./uploads")

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}
