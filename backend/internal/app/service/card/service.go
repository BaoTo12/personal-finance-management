package card

import (
	"context"
	"fmt"
	"pfn-backend/internal/app/entity"
	"pfn-backend/internal/app/repository"

	"github.com/google/uuid"
)

type Service interface {
	CreateCard(ctx context.Context, userID uuid.UUID, req CreateCardRequest) (*CardResponse, error)
	GetUserCards(ctx context.Context, userID uuid.UUID) ([]CardResponse, error)
	GetCard(ctx context.Context, cardID int64, userID uuid.UUID) (*CardResponse, error)
	UpdateCard(ctx context.Context, cardID int64, userID uuid.UUID, req UpdateCardRequest) (*CardResponse, error)
	ToggleFreeze(ctx context.Context, cardID int64, userID uuid.UUID) (*CardResponse, error)
	DeleteCard(ctx context.Context, cardID int64, userID uuid.UUID) error
}

type service struct {
	cardRepo repository.CardRepository
}

func NewService(cardRepo repository.CardRepository) Service {
	return &service{
		cardRepo: cardRepo,
	}
}

func (s *service) CreateCard(ctx context.Context, userID uuid.UUID, req CreateCardRequest) (*CardResponse, error) {
	// Extract last 4 digits
	last4 := req.CardNumber[len(req.CardNumber)-4:]

	// Set default color if not provided
	color := req.Color
	if color == "" {
		color = "from-[#667eea] to-[#764ba2]"
	}

	card := &entity.Card{
		UserID:          userID,
		CardNumber:      req.CardNumber, // In production, this should be encrypted
		CardNumberLast4: last4,
		HolderName:      req.HolderName,
		ExpiryDate:      req.ExpiryDate,
		CardType:        req.CardType,
		Alias:           req.Alias,
		Balance:         req.Balance,
		Color:           color,
		IsFrozen:        false,
	}

	if err := s.cardRepo.Create(ctx, card); err != nil {
		return nil, fmt.Errorf("failed to create card: %w", err)
	}

	return s.toResponse(card), nil
}

func (s *service) GetUserCards(ctx context.Context, userID uuid.UUID) ([]CardResponse, error) {
	cards, err := s.cardRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user cards: %w", err)
	}

	responses := make([]CardResponse, len(cards))
	for i, card := range cards {
		responses[i] = *s.toResponse(&card)
	}

	return responses, nil
}

func (s *service) GetCard(ctx context.Context, cardID int64, userID uuid.UUID) (*CardResponse, error) {
	card, err := s.cardRepo.FindByID(ctx, cardID)
	if err != nil {
		return nil, fmt.Errorf("failed to get card: %w", err)
	}

	// Check ownership
	if card.UserID != userID {
		return nil, fmt.Errorf("unauthorized access to card")
	}

	return s.toResponse(card), nil
}

func (s *service) UpdateCard(ctx context.Context, cardID int64, userID uuid.UUID, req UpdateCardRequest) (*CardResponse, error) {
	card, err := s.cardRepo.FindByID(ctx, cardID)
	if err != nil {
		return nil, fmt.Errorf("failed to get card: %w", err)
	}

	// Check ownership
	if card.UserID != userID {
		return nil, fmt.Errorf("unauthorized access to card")
	}

	// Update fields
	if req.Alias != "" {
		card.Alias = req.Alias
	}
	if req.Color != "" {
		card.Color = req.Color
	}

	if err := s.cardRepo.Update(ctx, card); err != nil {
		return nil, fmt.Errorf("failed to update card: %w", err)
	}

	return s.toResponse(card), nil
}

func (s *service) ToggleFreeze(ctx context.Context, cardID int64, userID uuid.UUID) (*CardResponse, error) {
	card, err := s.cardRepo.FindByID(ctx, cardID)
	if err != nil {
		return nil, fmt.Errorf("failed to get card: %w", err)
	}

	// Check ownership
	if card.UserID != userID {
		return nil, fmt.Errorf("unauthorized access to card")
	}

	if err := s.cardRepo.ToggleFreeze(ctx, cardID); err != nil {
		return nil, fmt.Errorf("failed to toggle freeze: %w", err)
	}

	// Reload card to get updated status
	card, err = s.cardRepo.FindByID(ctx, cardID)
	if err != nil {
		return nil, fmt.Errorf("failed to reload card: %w", err)
	}

	return s.toResponse(card), nil
}

func (s *service) DeleteCard(ctx context.Context, cardID int64, userID uuid.UUID) error {
	card, err := s.cardRepo.FindByID(ctx, cardID)
	if err != nil {
		return fmt.Errorf("failed to get card: %w", err)
	}

	// Check ownership
	if card.UserID != userID {
		return fmt.Errorf("unauthorized access to card")
	}

	if err := s.cardRepo.Delete(ctx, cardID); err != nil {
		return fmt.Errorf("failed to delete card: %w", err)
	}

	return nil
}

func (s *service) toResponse(card *entity.Card) *CardResponse {
	return &CardResponse{
		ID:              card.ID,
		UserID:          card.UserID,
		CardNumberLast4: card.CardNumberLast4,
		HolderName:      card.HolderName,
		ExpiryDate:      card.ExpiryDate,
		CardType:        card.CardType,
		Alias:           card.Alias,
		Balance:         card.Balance,
		Color:           card.Color,
		IsFrozen:        card.IsFrozen,
		CreatedAt:       card.CreatedAt,
		UpdatedAt:       card.UpdatedAt,
	}
}
