package usecase

import (
	"github.com/google/uuid"
	"github.com/pur108/ebook-platform/backend/internal/domain"
)

type LayerUsecase interface {
	AddLayer(imageID uuid.UUID, text string, x, y, w, h int, layerType domain.TextLayerType) (*domain.TextLayer, error)
	TranslateLayer(layerID uuid.UUID, targetLang string) (*domain.Translation, error)
}

type layerUsecase struct {
	layerRepo domain.LayerRepository
}

func NewLayerUsecase(layerRepo domain.LayerRepository) LayerUsecase {
	return &layerUsecase{layerRepo}
}

func (u *layerUsecase) AddLayer(imageID uuid.UUID, text string, x, y, w, h int, layerType domain.TextLayerType) (*domain.TextLayer, error) {
	layer := &domain.TextLayer{
		ID:             uuid.New(),
		ChapterImageID: imageID,
		OriginalText:   text,
		PositionX:      x,
		PositionY:      y,
		Width:          w,
		Height:         h,
		Type:           layerType,
	}

	if err := u.layerRepo.CreateLayer(layer); err != nil {
		return nil, err
	}

	return layer, nil
}

func (u *layerUsecase) TranslateLayer(layerID uuid.UUID, targetLang string) (*domain.Translation, error) {
	// STUB: Mock translation logic
	// In a real system, this would call an AI service (OpenAI, Google Translate, etc.)
	// For now, we just return a mock translation.

	mockTranslation := "Translated: " + targetLang // We would need the original text here, but for stub it's fine.

	translation := &domain.Translation{
		ID:                  uuid.New(),
		TextLayerID:         layerID,
		LanguageCode:        targetLang,
		TranslatedText:      mockTranslation,
		IsMachineTranslated: true,
		Verified:            false,
	}

	if err := u.layerRepo.CreateTranslation(translation); err != nil {
		return nil, err
	}

	return translation, nil
}
