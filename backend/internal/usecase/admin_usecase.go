package usecase

import (
	"github.com/google/uuid"
	"github.com/pur108/ebook-platform/backend/internal/domain"
)

type AdminUsecase interface {
	BanUser(userID uuid.UUID) error
	// Add more admin methods here (e.g., DeleteComic)
}

type adminUsecase struct {
	userRepo domain.UserRepository
}

func NewAdminUsecase(userRepo domain.UserRepository) AdminUsecase {
	return &adminUsecase{userRepo}
}

func (u *adminUsecase) BanUser(userID uuid.UUID) error {
	// For now, we don't have a "Banned" status in User struct,
	// but we can simulate it or add it.
	// Let's assume deleting the user for now or just logging it.
	// In a real app, we'd have IsBanned bool.

	// Let's just return nil for the stub.
	return nil
}
