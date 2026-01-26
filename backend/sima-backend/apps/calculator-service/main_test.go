package main

import (
	"strings"
	"testing"
)

func TestCompute(t *testing.T) {
	tests := []struct {
		name        string
		operation   string
		operands    []float64
		want        float64
		wantErr     bool
		errContains string
	}{
		{name: "add", operation: "add", operands: []float64{1, 2, 3}, want: 6},
		{name: "add-case-insensitive", operation: "ADD", operands: []float64{5, 5}, want: 10},
		{name: "subtract", operation: "subtract", operands: []float64{10, 3, 2}, want: 5},
		{name: "multiply", operation: "multiply", operands: []float64{2, 3, 4}, want: 24},
		{name: "divide", operation: "divide", operands: []float64{100, 5, 2}, want: 10},
		{name: "power", operation: "power", operands: []float64{2, 3}, want: 8},
		{name: "no-operands", operation: "add", operands: []float64{}, wantErr: true, errContains: "operands are required"},
		{name: "divide-missing-operand", operation: "divide", operands: []float64{10}, wantErr: true, errContains: "divide requires at least two operands"},
		{name: "divide-by-zero", operation: "divide", operands: []float64{10, 0}, wantErr: true, errContains: "division by zero"},
		{name: "power-missing-operand", operation: "power", operands: []float64{2}, wantErr: true, errContains: "power requires two operands"},
		{name: "unsupported", operation: "mod", operands: []float64{10, 3}, wantErr: true, errContains: "unsupported operation"},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			got, err := compute(tc.operation, tc.operands)

			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				if tc.errContains != "" && !strings.Contains(err.Error(), tc.errContains) {
					t.Fatalf("expected error containing %q, got %q", tc.errContains, err.Error())
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != tc.want {
				t.Fatalf("unexpected result: got %v, want %v", got, tc.want)
			}
		})
	}
}
