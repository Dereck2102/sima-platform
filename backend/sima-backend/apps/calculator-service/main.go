package main

import (
	"fmt"
	"log"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// CalcRequest defines the input payload for calculations.
type CalcRequest struct {
	Operation string    `json:"operation" binding:"required"`
	Operands  []float64 `json:"operands" binding:"required"`
	Batch     bool      `json:"batch,omitempty"`
}

// CalcResponse standardizes the service response structure.
type CalcResponse struct {
	Result    float64   `json:"result,omitempty"`
	Operation string    `json:"operation"`
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Error     string    `json:"error,omitempty"`
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.GET("/health", healthHandler)
	router.POST("/calculate", calculateHandler)

	log.Println("Starting Calculator Service on :3009")
	if err := router.Run(":3009"); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "Calculator Service is running",
		"version": "1.0.0",
		"time":    time.Now().UTC(),
	})
}

func calculateHandler(c *gin.Context) {
	var req CalcRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, CalcResponse{
			Operation: req.Operation,
			Status:    "error",
			Timestamp: time.Now().UTC(),
			Error:     "invalid payload",
		})
		return
	}

	result, err := compute(req.Operation, req.Operands)
	if err != nil {
		c.JSON(http.StatusBadRequest, CalcResponse{
			Operation: req.Operation,
			Status:    "error",
			Timestamp: time.Now().UTC(),
			Error:     err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, CalcResponse{
		Result:    result,
		Operation: strings.ToLower(req.Operation),
		Status:    "success",
		Timestamp: time.Now().UTC(),
	})
}

func compute(operation string, operands []float64) (float64, error) {
	if len(operands) == 0 {
		return 0, fmt.Errorf("operands are required")
	}

	switch strings.ToLower(operation) {
	case "add":
		var sum float64
		for _, v := range operands {
			sum += v
		}
		return sum, nil
	case "subtract":
		if len(operands) < 2 {
			return 0, fmt.Errorf("subtract requires at least two operands")
		}
		result := operands[0]
		for _, v := range operands[1:] {
			result -= v
		}
		return result, nil
	case "multiply":
		result := 1.0
		for _, v := range operands {
			result *= v
		}
		return result, nil
	case "divide":
		if len(operands) < 2 {
			return 0, fmt.Errorf("divide requires at least two operands")
		}
		result := operands[0]
		for _, v := range operands[1:] {
			if v == 0 {
				return 0, fmt.Errorf("division by zero")
			}
			result /= v
		}
		return result, nil
	case "power":
		if len(operands) < 2 {
			return 0, fmt.Errorf("power requires two operands")
		}
		return math.Pow(operands[0], operands[1]), nil
	default:
		return 0, fmt.Errorf("unsupported operation: %s", operation)
	}
}
