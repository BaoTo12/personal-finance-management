package transaction

import (
	"context"
	"fmt"
	"pfn-backend/internal/app/entity"
	"pfn-backend/internal/app/repository"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	CreateTransaction(ctx context.Context, userID uuid.UUID, req CreateTransactionRequest) (*TransactionResponse, error)
	GetUserTransactions(ctx context.Context, userID uuid.UUID, filter TransactionFilter) (*TransactionListResponse, error)
	GetStats(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) (*StatsResponse, error)
}

type service struct {
	txRepo   repository.TransactionRepository
	cardRepo repository.CardRepository
}

func NewService(
	txRepo repository.TransactionRepository,
	cardRepo repository.CardRepository,
) Service {
	return &service{
		txRepo:   txRepo,
		cardRepo: cardRepo,
	}
}

func (s *service) CreateTransaction(ctx context.Context, userID uuid.UUID, req CreateTransactionRequest) (*TransactionResponse, error) {
	// Verify card ownership
	card, err := s.cardRepo.FindByID(ctx, req.CardID)
	if err != nil {
		return nil, fmt.Errorf("card not found: %w", err)
	}

	if card.UserID != userID {
		return nil, fmt.Errorf("unauthorized access to card")
	}

	// Check if card is frozen
	if card.IsFrozen {
		return nil, fmt.Errorf("card is frozen")
	}

	// Create transaction
	tx := &entity.Transaction{
		UserID:          userID,
		CardID:          req.CardID,
		CategoryID:      req.CategoryID,
		TransactionType: req.TransactionType,
		Amount:          req.Amount,
		TransactionDate: req.TransactionDate,
		Description:     req.Description,
	}

	if err := s.txRepo.Create(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Update card balance based on transaction type
	var balanceChange int64
	switch req.TransactionType {
	case entity.TransactionTypeIncome:
		balanceChange = req.Amount
	case entity.TransactionTypeExpense:
		balanceChange = -req.Amount
	case entity.TransactionTypeTransfer:
		balanceChange = -req.Amount
	}

	if err := s.cardRepo.UpdateBalance(ctx, req.CardID, balanceChange); err != nil {
		return nil, fmt.Errorf("failed to update card balance: %w", err)
	}

	// Reload transaction with category
	tx, err = s.txRepo.FindByID(ctx, tx.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to reload transaction: %w", err)
	}

	return s.toResponse(tx), nil
}

func (s *service) GetUserTransactions(ctx context.Context, userID uuid.UUID, filter TransactionFilter) (*TransactionListResponse, error) {
	// Set defaults
	if filter.Limit == 0 {
		filter.Limit = 20
	}

	repoFilter := repository.TransactionFilter{
		TransactionType: filter.TransactionType,
		CategoryID:      filter.CategoryID,
		StartDate:       filter.StartDate,
		EndDate:         filter.EndDate,
		Limit:           filter.Limit,
		Offset:          filter.Offset,
	}

	transactions, err := s.txRepo.FindByUserID(ctx, userID, repoFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions: %w", err)
	}

	total, err := s.txRepo.Count(ctx, userID, repoFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to count transactions: %w", err)
	}

	responses := make([]TransactionResponse, len(transactions))
	for i, tx := range transactions {
		responses[i] = *s.toResponse(&tx)
	}

	return &TransactionListResponse{
		Transactions: responses,
		Total:        total,
		Limit:        filter.Limit,
		Offset:       filter.Offset,
	}, nil
}

func (s *service) GetStats(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) (*StatsResponse, error) {
	stats, err := s.txRepo.GetStats(ctx, userID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get stats: %w", err)
	}

	return &StatsResponse{
		TotalIncome:   stats.TotalIncome,
		TotalExpense:  stats.TotalExpense,
		TotalTransfer: stats.TotalTransfer,
		NetIncome:     stats.TotalIncome - stats.TotalExpense,
		Count:         stats.Count,
	}, nil
}

func (s *service) toResponse(tx *entity.Transaction) *TransactionResponse {
	resp := &TransactionResponse{
		ID:              tx.ID,
		UserID:          tx.UserID,
		CardID:          tx.CardID,
		CategoryID:      tx.CategoryID,
		TransactionType: tx.TransactionType,
		Amount:          tx.Amount,
		TransactionDate: tx.TransactionDate,
		Description:     tx.Description,
		CreatedAt:       tx.CreatedAt,
	}

	if tx.Category != nil {
		resp.Category = &CategoryInfo{
			ID:   tx.Category.ID,
			Name: tx.Category.Name,
			Icon: tx.Category.Icon,
		}
	}

	return resp
}
