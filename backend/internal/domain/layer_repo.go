package domain

import (
	"github.com/google/uuid"
)

type LayerRepository interface {
	CreateLayer(layer *TextLayer) error
	GetLayersByImageID(imageID uuid.UUID) ([]TextLayer, error)
	CreateTranslation(translation *Translation) error
}
