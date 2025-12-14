package handlers

import (
	"net/http"
	"pfn-backend/internal/app/service/transaction"
	"time"

	"github.com/gin-gonic/gin"
)

type TransactionHandler struct {
	txService transaction.Service
}

func NewTransactionHandler(txService transaction.Service) *TransactionHandler {
	return &TransactionHandler{
		txService: txService,
	}
}

// CreateTransaction godoc
// @Summary Create a new transaction
// @Tags transactions
// @Security Bearer
// @Accept json
// @Produce json
// @Param request body transaction.CreateTransactionRequest true "Transaction data"
// @Success 201 {object} transaction.TransactionResponse
// @Failure 400,401 {object} map[string]interface{}
// @Router /api/v1/transactions [post]
func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req transaction.CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.txService.CreateTransaction(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// GetUserTransactions godoc
// @Summary Get user transactions with filters
// @Tags transactions
// @Security Bearer
// @Produce json
// @Param transaction_type query string false "Transaction type" Enums(Income, Expense, Transfer)
// @Param category_id query int false "Category ID"
// @Param start_date query string false "Start date (RFC3339)"
// @Param end_date query string false "End date (RFC3339)"
// @Param limit query int false "Limit" default(20)
// @Param offset query int false "Offset" default(0)
// @Success 200 {object} transaction.TransactionListResponse
// @Failure 401 {object} map[string]interface{}
// @Router /api/v1/transactions [get]
func (h *TransactionHandler) GetUserTransactions(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var filter transaction.TransactionFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.txService.GetUserTransactions(c.Request.Context(), userID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get transactions"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetStats godoc
// @Summary Get transaction statistics
// @Tags transactions
// @Security Bearer
// @Produce json
// @Param start_date query string false "Start date (RFC3339)"
// @Param end_date query string false "End date (RFC3339)"
// @Success 200 {object} transaction.StatsResponse
// @Failure 401 {object} map[string]interface{}
// @Router /api/v1/transactions/stats [get]
func (h *TransactionHandler) GetStats(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var startDate, endDate *time.Time

	if startDateStr := c.Query("start_date"); startDateStr != "" {
		parsed, err := time.Parse(time.RFC3339, startDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_date format"})
			return
		}
		startDate = &parsed
	}

	if endDateStr := c.Query("end_date"); endDateStr != "" {
		parsed, err := time.Parse(time.RFC3339, endDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_date format"})
			return
		}
		endDate = &parsed
	}

	stats, err := h.txService.GetStats(c.Request.Context(), userID, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get statistics"})
		return
	}

	c.JSON(http.StatusOK, stats)
}
