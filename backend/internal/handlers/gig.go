package handlers

import (
	"net/http"
	"sunyi-api/internal/models"
	"sunyi-api/internal/repository"

	"github.com/gin-gonic/gin"
)

type GigHandler struct {
    gigRepo *repository.GigRepository
}

func NewGigHandler(gigRepo *repository.GigRepository) *GigHandler {
    return &GigHandler{gigRepo: gigRepo}
}

func (h *GigHandler) CreateGig(c *gin.Context) {
    var input models.CreateGigInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Get organizer ID from JWT token
    organizerID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    gig := &models.Gig{
        Title:        input.Title,
        Description:  input.Description,
        VenueName:    input.VenueName,
        VenueAddress: input.VenueAddress,
        Latitude:     input.Latitude,
        Longitude:    input.Longitude,
        Date:         input.Date,
        StartTime:    input.StartTime,
        EndTime:      input.EndTime,
        Price:        input.Price,
        OrganizerID:  organizerID.(string),
        Genres:       input.Genres,
    }

    if err := h.gigRepo.Create(gig); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create gig"})
        return
    }

    c.JSON(http.StatusCreated, gig)
}

func (h *GigHandler) GetAllGigs(c *gin.Context) {
    gigs, err := h.gigRepo.GetAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve gigs"})
        return
    }

    c.JSON(http.StatusOK, gigs)
}

func (h *GigHandler) GetGigByID(c *gin.Context) {
    id := c.Param("id")

    gig, err := h.gigRepo.GetByID(id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve gig"})
        return
    }
    if gig == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Gig not found"})
        return
    }

    c.JSON(http.StatusOK, gig)
}

func (h *GigHandler) GetGigsByOrganizer(c *gin.Context) {
    organizerID := c.Param("organizerId")

    gigs, err := h.gigRepo.GetByOrganizerID(organizerID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve gigs"})
        return
    }

    c.JSON(http.StatusOK, gigs)
}

func (h *GigHandler) UpdateGig(c *gin.Context) {
    id := c.Param("id")
    userID, _ := c.Get("user_id")

    // Get existing gig
    existingGig, err := h.gigRepo.GetByID(id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve gig"})
        return
    }
    if existingGig == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Gig not found"})
        return
    }

    // Check if user is the organizer
    if existingGig.OrganizerID != userID.(string) {
        c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own gigs"})
        return
    }

    var input models.CreateGigInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Update gig fields
    existingGig.Title = input.Title
    existingGig.Description = input.Description
    existingGig.VenueName = input.VenueName
    existingGig.VenueAddress = input.VenueAddress
    existingGig.Latitude = input.Latitude
    existingGig.Longitude = input.Longitude
    existingGig.Date = input.Date
    existingGig.StartTime = input.StartTime
    existingGig.EndTime = input.EndTime
    existingGig.Price = input.Price
    existingGig.Genres = input.Genres

    if err := h.gigRepo.Update(existingGig); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update gig"})
        return
    }

    c.JSON(http.StatusOK, existingGig)
}

func (h *GigHandler) DeleteGig(c *gin.Context) {
    id := c.Param("id")
    userID, _ := c.Get("user_id")

    // Get existing gig
    existingGig, err := h.gigRepo.GetByID(id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve gig"})
        return
    }
    if existingGig == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Gig not found"})
        return
    }

    // Check if user is the organizer
    if existingGig.OrganizerID != userID.(string) {
        c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own gigs"})
        return
    }

    if err := h.gigRepo.Delete(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete gig"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Gig deleted successfully"})
}