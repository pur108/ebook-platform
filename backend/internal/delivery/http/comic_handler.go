package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/pur108/ebook-platform/backend/internal/domain"
	"github.com/pur108/ebook-platform/backend/internal/middleware"
	"github.com/pur108/ebook-platform/backend/internal/usecase"
)

type ComicHandler struct {
	comicUsecase usecase.ComicUsecase
}

func NewComicHandler(app *fiber.App, comicUsecase usecase.ComicUsecase) {
	handler := &ComicHandler{comicUsecase}

	// Public routes
	app.Get("/api/series", handler.ListSeries)
	app.Get("/api/series/:id", handler.GetSeries)
	app.Get("/api/chapters/:id", handler.GetChapter)

	// Creator routes
	creatorGroup := app.Group("/api/creator/series", middleware.Protected(), middleware.RoleRequired(domain.RoleCreator, domain.RoleAdmin))
	creatorGroup.Post("/", handler.CreateSeries)
}

func (h *ComicHandler) CreateSeries(c *fiber.Ctx) error {
	var req usecase.CreateSeriesInput
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	userIDStr := c.Locals("user_id").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}
	req.CreatorID = userID

	// Validation
	if req.Title.En == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "English title is required"})
	}
	if req.Title.En == "" && req.Title.Th == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Title must have at least one language"})
	}

	series, err := h.comicUsecase.CreateSeries(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(series)
}

func (h *ComicHandler) GetSeries(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid series ID"})
	}

	series, err := h.comicUsecase.GetSeries(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Series not found"})
	}

	return c.JSON(series)
}

func (h *ComicHandler) GetChapter(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid chapter ID"})
	}

	chapter, err := h.comicUsecase.GetChapter(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Chapter not found"})
	}

	return c.JSON(chapter)
}

func (h *ComicHandler) ListSeries(c *fiber.Ctx) error {
	series, err := h.comicUsecase.ListSeries()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch series"})
	}

	return c.JSON(series)
}
