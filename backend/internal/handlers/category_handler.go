package handlers

import (
	"net/http"
	"pfn-backend/internal/app/service/category"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	categoryService category.Service
}

func NewCategoryHandler(categoryService category.Service) *CategoryHandler {
	return &CategoryHandler{
		categoryService: categoryService,
	}
}

// ListCategories godoc
// @Summary List all categories
// @Tags categories
// @Security Bearer
// @Produce json
// @Param type query string false "Category type" Enums(Income, Expense, Transfer)
// @Success 200 {array} category.CategoryResponse
// @Failure 401 {object} map[string]interface{}
// @Router /api/v1/categories [get]
func (h *CategoryHandler) ListCategories(c *gin.Context) {
	categoryType := c.Query("type")

	var typePtr *string
	if categoryType != "" {
		typePtr = &categoryType
	}

	categories, err := h.categoryService.ListCategories(c.Request.Context(), typePtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get categories"})
		return
	}

	c.JSON(http.StatusOK, categories)
}
