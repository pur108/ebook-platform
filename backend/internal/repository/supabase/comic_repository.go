package postgres

import (
	"github.com/google/uuid"
	"github.com/pur108/ebook-platform/backend/internal/domain"
	"gorm.io/gorm"
)

type comicRepository struct {
	db *gorm.DB
}

func NewComicRepository(db *gorm.DB) domain.ComicRepository {
	return &comicRepository{db}
}

func (r *comicRepository) CreateSeries(series *domain.Series) error {
	return r.db.Create(series).Error
}

func (r *comicRepository) GetSeriesByID(id uuid.UUID) (*domain.Series, error) {
	var series domain.Series
	err := r.db.Preload("Seasons.Chapters").First(&series, id).Error
	if err != nil {
		return nil, err
	}
	return &series, nil
}

func (r *comicRepository) GetChapterByID(id uuid.UUID) (*domain.Chapter, error) {
	var chapter domain.Chapter
	err := r.db.Preload("Images.TextLayers.Translations").First(&chapter, id).Error
	if err != nil {
		return nil, err
	}
	return &chapter, nil
}

func (r *comicRepository) ListSeries() ([]domain.Series, error) {
	var series []domain.Series
	// Limit to 20 for now, order by updated_at desc
	err := r.db.Order("updated_at desc").Limit(20).Find(&series).Error
	if err != nil {
		return nil, err
	}
	return series, nil
}
