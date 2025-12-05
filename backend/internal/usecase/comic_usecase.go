package usecase

import (
	"time"

	"github.com/google/uuid"
	"github.com/pur108/ebook-platform/backend/internal/domain"
)

type ComicUsecase interface {
	CreateSeries(input CreateSeriesInput) (*domain.Series, error)
	GetSeries(id uuid.UUID) (*domain.Series, error)
	GetChapter(id uuid.UUID) (*domain.Chapter, error)
	ListSeries() ([]domain.Series, error)
}

type comicUsecase struct {
	comicRepo domain.ComicRepository
}

func NewComicUsecase(comicRepo domain.ComicRepository) ComicUsecase {
	return &comicUsecase{comicRepo}
}

type CreateSeriesInput struct {
	CreatorID           uuid.UUID
	Title               domain.MultilingualText
	Subtitle            domain.MultilingualText
	Description         domain.MultilingualText
	Author              string
	Genres              []string
	Tags                []domain.MultilingualText
	ThumbnailURL        string
	CoverImageURL       string
	BannerImageURL      string
	Status              domain.SeriesStatus
	Visibility          string
	NSFW                bool
	SchedulePublishAt   *time.Time
	MonetizationEnabled bool
	MonetizationType    string
	DefaultUnlockType   string
}

func (u *comicUsecase) CreateSeries(input CreateSeriesInput) (*domain.Series, error) {
	series := &domain.Series{
		ID:          uuid.New(),
		CreatorID:   input.CreatorID,
		Title:       input.Title,
		Subtitle:    input.Subtitle,
		Description: input.Description,
		Author:      input.Author,
		Genres:      input.Genres,

		ThumbnailURL:        input.ThumbnailURL,
		CoverImageURL:       input.CoverImageURL,
		BannerImageURL:      input.BannerImageURL,
		Status:              input.Status,
		Visibility:          input.Visibility,
		NSFW:                input.NSFW,
		SchedulePublishAt:   input.SchedulePublishAt,
		MonetizationEnabled: input.MonetizationEnabled,
		MonetizationType:    input.MonetizationType,
		DefaultUnlockType:   input.DefaultUnlockType,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	// Process Tags
	var tags []domain.Tag
	for _, t := range input.Tags {
		tagID := uuid.New()
		slug := t.En // Simple slug for now, ideally use a slug generator

		tags = append(tags, domain.Tag{
			ID:        tagID,
			Slug:      slug,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Translations: []domain.TagTranslation{
				{
					ID:       uuid.New(),
					TagID:    tagID,
					Language: "en",
					Name:     t.En,
				},
				{
					ID:       uuid.New(),
					TagID:    tagID,
					Language: "th",
					Name:     t.Th,
				},
			},
		})
	}
	series.Tags = tags

	if err := u.comicRepo.CreateSeries(series); err != nil {
		return nil, err
	}

	return series, nil
}

func (u *comicUsecase) GetSeries(id uuid.UUID) (*domain.Series, error) {
	return u.comicRepo.GetSeriesByID(id)
}

func (u *comicUsecase) GetChapter(id uuid.UUID) (*domain.Chapter, error) {
	return u.comicRepo.GetChapterByID(id)
}

func (u *comicUsecase) ListSeries() ([]domain.Series, error) {
	return u.comicRepo.ListSeries()
}
