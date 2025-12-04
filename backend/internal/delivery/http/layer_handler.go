package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/pur108/ebook-platform/backend/internal/domain"
	"github.com/pur108/ebook-platform/backend/internal/middleware"
	"github.com/pur108/ebook-platform/backend/internal/usecase"
)

type LayerHandler struct {
	layerUsecase usecase.LayerUsecase
}

func NewLayerHandler(app *fiber.App, layerUsecase usecase.LayerUsecase) {
	handler := &LayerHandler{layerUsecase}

	// Creator routes
	creatorGroup := app.Group("/api/creator/layers", middleware.Protected(), middleware.RoleRequired(domain.RoleCreator, domain.RoleAdmin))
	creatorGroup.Post("/", handler.AddLayer)
	creatorGroup.Post("/:id/translate", handler.TranslateLayer)
}

func (h *LayerHandler) AddLayer(c *fiber.Ctx) error {
	type Request struct {
		ChapterImageID uuid.UUID            `json:"chapter_image_id"`
		OriginalText   string               `json:"original_text"`
		PositionX      int                  `json:"position_x"`
		PositionY      int                  `json:"position_y"`
		Width          int                  `json:"width"`
		Height         int                  `json:"height"`
		Type           domain.TextLayerType `json:"type"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	layer, err := h.layerUsecase.AddLayer(req.ChapterImageID, req.OriginalText, req.PositionX, req.PositionY, req.Width, req.Height, req.Type)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(layer)
}

func (h *LayerHandler) TranslateLayer(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid layer ID"})
	}

	type Request struct {
		TargetLang string `json:"target_lang"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	translation, err := h.layerUsecase.TranslateLayer(id, req.TargetLang)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(translation)
}
