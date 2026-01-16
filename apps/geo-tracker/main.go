// Package main implements a real-time asset geo-tracking service
// using goroutines for concurrent location updates and WebSocket for client connections.
package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	log "github.com/sirupsen/logrus"
)

// Location represents a GPS coordinate
type Location struct {
	AssetID   string    `json:"assetId"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Speed     float64   `json:"speed"`      // km/h
	Heading   float64   `json:"heading"`    // degrees
	Accuracy  float64   `json:"accuracy"`   // meters
	Timestamp time.Time `json:"timestamp"`
	TenantID  string    `json:"tenantId"`
}

// AssetTracker manages location updates for multiple assets
type AssetTracker struct {
	locations map[string]*Location // assetID -> latest location
	mu        sync.RWMutex
	broadcast chan *Location
	clients   map[*websocket.Conn]string // client -> tenantID subscription
	clientsMu sync.Mutex
}

// NewAssetTracker creates a new tracker instance
func NewAssetTracker() *AssetTracker {
	return &AssetTracker{
		locations: make(map[string]*Location),
		broadcast: make(chan *Location, 100),
		clients:   make(map[*websocket.Conn]string),
	}
}

// UpdateLocation handles incoming location updates (goroutine-safe)
func (t *AssetTracker) UpdateLocation(loc *Location) {
	t.mu.Lock()
	loc.Timestamp = time.Now().UTC()
	t.locations[loc.AssetID] = loc
	t.mu.Unlock()

	// Non-blocking broadcast
	select {
	case t.broadcast <- loc:
	default:
		log.Warn("Broadcast channel full, dropping update")
	}
}

// GetLocation retrieves the latest location for an asset
func (t *AssetTracker) GetLocation(assetID string) (*Location, bool) {
	t.mu.RLock()
	defer t.mu.RUnlock()
	loc, ok := t.locations[assetID]
	return loc, ok
}

// GetAllLocations returns all tracked assets for a tenant
func (t *AssetTracker) GetAllLocations(tenantID string) []*Location {
	t.mu.RLock()
	defer t.mu.RUnlock()
	result := make([]*Location, 0)
	for _, loc := range t.locations {
		if loc.TenantID == tenantID {
			result = append(result, loc)
		}
	}
	return result
}

// BroadcastLoop runs in a goroutine to send updates to WebSocket clients
func (t *AssetTracker) BroadcastLoop() {
	log.Info("Starting broadcast loop...")
	for loc := range t.broadcast {
		t.clientsMu.Lock()
		for client, tenantID := range t.clients {
			// Only send to clients subscribed to this tenant
			if tenantID == "" || tenantID == loc.TenantID {
				msg, _ := json.Marshal(map[string]interface{}{
					"type":     "location_update",
					"location": loc,
				})
				if err := client.WriteMessage(websocket.TextMessage, msg); err != nil {
					log.WithError(err).Warn("Failed to send to client")
					client.Close()
					delete(t.clients, client)
				}
			}
		}
		t.clientsMu.Unlock()
	}
}

// SimulateDevices generates fake location updates (for demo purposes)
func (t *AssetTracker) SimulateDevices(count int, tenantID string) {
	log.Infof("Simulating %d devices for tenant %s...", count, tenantID)
	
	// Quito, Ecuador coordinates as base
	baseLat := -0.1807
	baseLng := -78.4678

	for i := 0; i < count; i++ {
		assetID := fmt.Sprintf("asset-%s-%d", tenantID[:3], i+1)
		go func(id string) {
			lat := baseLat + (rand.Float64()-0.5)*0.1
			lng := baseLng + (rand.Float64()-0.5)*0.1
			
			for {
				// Simulate movement
				lat += (rand.Float64() - 0.5) * 0.001
				lng += (rand.Float64() - 0.5) * 0.001
				
				loc := &Location{
					AssetID:   id,
					Latitude:  lat,
					Longitude: lng,
					Speed:     rand.Float64() * 60,
					Heading:   rand.Float64() * 360,
					Accuracy:  rand.Float64()*20 + 5,
					TenantID:  tenantID,
				}
				t.UpdateLocation(loc)
				
				time.Sleep(time.Duration(2+rand.Intn(3)) * time.Second)
			}
		}(assetID)
	}
}

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// Handlers

func (t *AssetTracker) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.WithError(err).Error("WebSocket upgrade failed")
		return
	}
	
	tenantID := r.URL.Query().Get("tenantId")
	t.clientsMu.Lock()
	t.clients[conn] = tenantID
	t.clientsMu.Unlock()
	
	log.Infof("New WebSocket client connected (tenant: %s)", tenantID)
	
	// Send initial locations
	initialLocs := t.GetAllLocations(tenantID)
	msg, _ := json.Marshal(map[string]interface{}{
		"type":      "initial_locations",
		"locations": initialLocs,
	})
	conn.WriteMessage(websocket.TextMessage, msg)
	
	// Keep connection alive and handle messages
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Info("Client disconnected")
			t.clientsMu.Lock()
			delete(t.clients, conn)
			t.clientsMu.Unlock()
			return
		}
	}
}

func (t *AssetTracker) handleUpdateLocation(w http.ResponseWriter, r *http.Request) {
	var loc Location
	if err := json.NewDecoder(r.Body).Decode(&loc); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	t.UpdateLocation(&loc)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "received",
		"assetId": loc.AssetID,
	})
}

func (t *AssetTracker) handleGetLocation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	assetID := vars["assetId"]
	
	loc, ok := t.GetLocation(assetID)
	if !ok {
		http.Error(w, "Asset not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loc)
}

func (t *AssetTracker) handleGetAllLocations(w http.ResponseWriter, r *http.Request) {
	tenantID := r.URL.Query().Get("tenantId")
	if tenantID == "" {
		tenantID = "default"
	}
	
	locs := t.GetAllLocations(tenantID)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(locs)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "geo-tracker",
		"time":    time.Now().UTC().Format(time.RFC3339),
	})
}

func main() {
	// Load environment variables
	godotenv.Load()
	
	// Configure logging
	log.SetFormatter(&log.JSONFormatter{})
	log.SetLevel(log.InfoLevel)
	
	// Initialize tracker
	tracker := NewAssetTracker()
	
	// Start broadcast loop in goroutine
	go tracker.BroadcastLoop()
	
	// Simulate devices for demo (env: SIMULATE_DEVICES=true)
	if os.Getenv("SIMULATE_DEVICES") == "true" {
		tracker.SimulateDevices(5, "uce-001")
		tracker.SimulateDevices(3, "uce-002")
	}
	
	// Setup router
	r := mux.NewRouter()
	
	// API routes
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/health", handleHealth).Methods("GET")
	api.HandleFunc("/locations", tracker.handleGetAllLocations).Methods("GET")
	api.HandleFunc("/locations/{assetId}", tracker.handleGetLocation).Methods("GET")
	api.HandleFunc("/locations", tracker.handleUpdateLocation).Methods("POST")
	
	// WebSocket route
	r.HandleFunc("/ws", tracker.handleWebSocket)
	
	// Get port from env
	port := os.Getenv("PORT")
	if port == "" {
		port = "3009"
	}
	
	log.Infof("🌍 Geo-Tracker Service starting on port %s", port)
	log.Info("Endpoints:")
	log.Info("  GET  /api/health - Health check")
	log.Info("  GET  /api/locations - Get all locations")
	log.Info("  GET  /api/locations/{assetId} - Get asset location")
	log.Info("  POST /api/locations - Update location")
	log.Info("  WS   /ws?tenantId=xxx - Real-time updates")
	
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
