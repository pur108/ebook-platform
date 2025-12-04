package domain

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type TextLayerType string

const (
	LayerBubble    TextLayerType = "bubble"
	LayerNarration TextLayerType = "narration"
	LayerSFX       TextLayerType = "sfx"
)

type TextLayer struct {
	ID             uuid.UUID      `gorm:"type:uuid;primary_key;" json:"id"`
	ChapterImageID uuid.UUID      `gorm:"type:uuid;not null" json:"chapter_image_id"`
	OriginalText   string         `gorm:"not null" json:"original_text"`
	PositionX      int            `json:"position_x"`
	PositionY      int            `json:"position_y"`
	Width          int            `json:"width"`
	Height         int            `json:"height"`
	StyleJSON      datatypes.JSON `json:"style_json"` // Font, size, color
	Type           TextLayerType  `gorm:"default:'bubble'" json:"type"`
	Translations   []Translation  `json:"translations,omitempty"`
}

type Translation struct {
	ID                  uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	TextLayerID         uuid.UUID `gorm:"type:uuid;not null" json:"text_layer_id"`
	LanguageCode        string    `gorm:"size:5;not null" json:"language_code"`
	TranslatedText      string    `gorm:"not null" json:"translated_text"`
	IsMachineTranslated bool      `gorm:"default:false" json:"is_machine_translated"`
	Verified            bool      `gorm:"default:false" json:"verified"`
}
