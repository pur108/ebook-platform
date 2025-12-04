package postgres

import (
	"github.com/google/uuid"
	"github.com/pur108/ebook-platform/backend/internal/domain"
	"gorm.io/gorm"
)

type layerRepository struct {
	db *gorm.DB
}

func NewLayerRepository(db *gorm.DB) domain.LayerRepository {
	return &layerRepository{db}
}

func (r *layerRepository) CreateLayer(layer *domain.TextLayer) error {
	return r.db.Create(layer).Error
}

func (r *layerRepository) GetLayersByImageID(imageID uuid.UUID) ([]domain.TextLayer, error) {
	var layers []domain.TextLayer
	err := r.db.Where("chapter_image_id = ?", imageID).Preload("Translations").Find(&layers).Error
	if err != nil {
		return nil, err
	}
	return layers, nil
}

func (r *layerRepository) CreateTranslation(translation *domain.Translation) error {
	return r.db.Create(translation).Error
}
