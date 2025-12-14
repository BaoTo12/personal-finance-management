package handlers

import (
	"net/http"
	"pfn-backend/internal/app/service/card"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CardHandler struct {
	cardService card.Service
}

func NewCardHandler(cardService card.Service) *CardHandler {
	return &CardHandler{
		cardService: cardService,
	}
}

// CreateCard godoc
// @Summary Create a new card
// @Tags cards
// @Security Bearer
// @Accept json
// @Produce json
// @Param request body card.CreateCardRequest true "Card data"
// @Success 201 {object} card.CardResponse
// @Failure 400,401 {object} map[string]interface{}
// @Router /api/v1/cards [post]
func (h *CardHandler) CreateCard(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req card.CreateCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.cardService.CreateCard(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// GetUserCards godoc
// @Summary Get all user cards
// @Tags cards
// @Security Bearer
// @Produce json
// @Success 200 {array} card.CardResponse
// @Failure 401 {object} map[string]interface{}
// @Router /api/v1/cards [get]
func (h *CardHandler) GetUserCards(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	cards, err := h.cardService.GetUserCards(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get cards"})
		return
	}

	c.JSON(http.StatusOK, cards)
}

// GetCard godoc
// @Summary Get card by ID
// @Tags cards
// @Security Bearer
// @Produce json
// @Param id path int true "Card ID"
// @Success 200 {object} card.CardResponse
// @Failure 400,401,404 {object} map[string]interface{}
// @Router /api/v1/cards/{id} [get]
func (h *CardHandler) GetCard(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	cardID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid card ID"})
		return
	}

	card, err := h.cardService.GetCard(c.Request.Context(), cardID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, card)
}

// UpdateCard godoc
// @Summary Update card
// @Tags cards
// @Security Bearer
// @Accept json
// @Produce json
// @Param id path int true "Card ID"
// @Param request body card.UpdateCardRequest true "Card update data"
// @Success 200 {object} card.CardResponse
// @Failure 400,401,404 {object} map[string]interface{}
// @Router /api/v1/cards/{id} [put]
func (h *CardHandler) UpdateCard(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	cardID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid card ID"})
		return
	}

	var req card.UpdateCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.cardService.UpdateCard(c.Request.Context(), cardID, userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// ToggleFreeze godoc
// @Summary Toggle card freeze status
// @Tags cards
// @Security Bearer
// @Produce json
// @Param id path int true "Card ID"
// @Success 200 {object} card.CardResponse
// @Failure 400,401,404 {object} map[string]interface{}
// @Router /api/v1/cards/{id}/freeze [post]
func (h *CardHandler) ToggleFreeze(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	cardID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid card ID"})
		return
	}

	response, err := h.cardService.ToggleFreeze(c.Request.Context(), cardID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// DeleteCard godoc
// @Summary Delete card
// @Tags cards
// @Security Bearer
// @Param id path int true "Card ID"
// @Success 204
// @Failure 400,401,404 {object} map[string]interface{}
// @Router /api/v1/cards/{id} [delete]
func (h *CardHandler) DeleteCard(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	cardID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid card ID"})
		return
	}

	if err := h.cardService.DeleteCard(c.Request.Context(), cardID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
