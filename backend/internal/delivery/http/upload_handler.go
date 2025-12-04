package http

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/pur108/ebook-platform/backend/internal/middleware"
)

type UploadHandler struct{}

func NewUploadHandler(app *fiber.App) {
	handler := &UploadHandler{}

	app.Post("/api/upload", middleware.Protected(), handler.UploadFile)
}

func (h *UploadHandler) UploadFile(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No file uploaded"})
	}

	// Validate file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" && ext != ".gif" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid file type. Only images are allowed."})
	}

	// Generate unique filename
	filename := uuid.New().String() + ext
	savePath := fmt.Sprintf("./uploads/%s", filename)

	// Save file
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// Return public URL
	// Assuming the server is running on localhost:8080 and serving /uploads
	// In production, this should be configured via env vars or return a relative path
	url := fmt.Sprintf("http://localhost:8080/uploads/%s", filename)

	return c.JSON(fiber.Map{
		"url": url,
	})
}
