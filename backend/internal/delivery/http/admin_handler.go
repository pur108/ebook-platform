package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/pur108/ebook-platform/backend/internal/domain"
	"github.com/pur108/ebook-platform/backend/internal/middleware"
	"github.com/pur108/ebook-platform/backend/internal/usecase"
)

type AdminHandler struct {
	adminUsecase usecase.AdminUsecase
}

func NewAdminHandler(app *fiber.App, adminUsecase usecase.AdminUsecase) {
	handler := &AdminHandler{adminUsecase}

	group := app.Group("/api/admin", middleware.Protected(), middleware.RoleRequired(domain.RoleAdmin))
	group.Post("/users/:id/ban", handler.BanUser)
}

func (h *AdminHandler) BanUser(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	if err := h.adminUsecase.BanUser(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "User banned successfully"})
}
