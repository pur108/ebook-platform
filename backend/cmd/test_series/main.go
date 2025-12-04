package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/google/uuid"
)

func main() {
	// 1. Signup a user
	username := "test_creator_" + uuid.New().String()[:8]
	email := username + "@example.com"
	password := "password123"

	signupBody := fmt.Sprintf(`{"username":"%s", "email":"%s", "password":"%s", "role":"creator"}`, username, email, password)
	resp, err := http.Post("http://localhost:8080/api/auth/signup", "application/json", strings.NewReader(signupBody))
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		log.Fatalf("Signup failed: %d", resp.StatusCode)
	}

	var userResp map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&userResp)
	// Login to get token
	loginBody := fmt.Sprintf(`{"identifier":"%s", "password":"%s"}`, email, password)
	resp, err = http.Post("http://localhost:8080/api/auth/login", "application/json", strings.NewReader(loginBody))
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	var loginResp map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&loginResp)
	token := loginResp["token"].(string)

	// 2. Create a series
	seriesTitle := "Test Series"
	seriesDesc := "This is a test description"
	createSeriesBody := fmt.Sprintf(`{
		"title": {"en": "%s"},
		"description": {"en": "%s"},
		"cover_image_url": "http://example.com/cover.jpg"
	}`, seriesTitle, seriesDesc)

	client := &http.Client{}
	req, _ := http.NewRequest("POST", "http://localhost:8080/api/creator/series/", strings.NewReader(createSeriesBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err = client.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		log.Fatalf("Create series failed: %d", resp.StatusCode)
	}

	// 3. List series and check description
	resp, err = http.Get("http://localhost:8080/api/series")
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	var seriesList []map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&seriesList)

	if len(seriesList) == 0 {
		log.Fatal("No series found")
	}

	found := false
	for _, s := range seriesList {
		desc, ok := s["description"].(map[string]interface{})
		if ok && desc["en"] == seriesDesc {
			found = true
			break
		}
	}

	if found {
		os.WriteFile("test_result.txt", []byte("SUCCESS: Series description found"), 0644)
		fmt.Println("SUCCESS: Series description found")
	} else {
		os.WriteFile("test_result.txt", []byte("FAILURE: Series description not found"), 0644)
		log.Fatal("FAILURE: Series description not found")
	}
}
