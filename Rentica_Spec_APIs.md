# Rentica — Car Rental Marketplace API Specification

---

## 1. Overview

Rentica is a car rental marketplace connecting car owners with renters. This document describes the REST API endpoints provided by the Node/Express backend.

---

## 2. Base URL

```
http://localhost:5000/api
```

---

## 3. Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

Roles: `user` (renter/owner), `admin`

---

## 4. Auth Endpoints

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string (optional)"
}
```

### POST /auth/login
Authenticate and receive JWT.

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### GET /auth/me
Get current authenticated user profile. *(Protected)*

---

## 5. Listing Endpoints

### GET /listings
Get all active listings. Supports filters: `brand`, `bodyType`, `location`, `fuelType`, `minPrice`, `maxPrice`, `minYear`, `maxYear`. Sort by `price`, `-price`, `createdAt`, `-createdAt`.

### POST /listings *(Protected)*
Create a new rental listing.

**Body (multipart/form-data):**
```
brand, model, year, kmDriven, fuelType, transmission, bodyType, location
pricePerDay (required)
availableFrom, availableTo (optional dates)
description (optional)
images[] (optional file uploads)
```

### GET /listings/mine *(Protected)*
Get current user's listings.

### GET /listings/:id
Get a single listing by ID.

### PUT /listings/:id *(Protected, Owner)*
Update a listing. Same fields as POST.

### DELETE /listings/:id *(Protected, Owner)*
Delete a listing and its uploaded images.

### POST /listings/:id/images *(Protected, Owner)*
Upload additional images to a listing.

### DELETE /listings/:id/images/:imageIndex *(Protected, Owner)*
Remove a specific image by index.

---

## 6. Booking Endpoints

### POST /bookings *(Protected)*
Create a new booking request.

**Body:**
```json
{
  "listingId": "ObjectId",
  "startDate": "ISO date string",
  "endDate": "ISO date string",
  "message": "string (optional)"
}
```

**Response:** Booking object with computed `duration` (days) and `totalCost` (pricePerDay × duration).

### GET /bookings/mine *(Protected)*
Get current user's bookings (as renter or owner). Admin sees all.

### GET /bookings/:id *(Protected)*
Get a single booking. Only accessible by the renter, owner, or admin.

### PUT /bookings/:id/status *(Protected)*
Update booking status.

**Body:**
```json
{
  "status": "pending | confirmed | cancelled | completed"
}
```

---

## 7. Admin Endpoints *(Protected, Admin only)*

### GET /admin/stats
Get dashboard metrics: `activeListings`, `totalUsers`, `awaitingReview`.

### GET /admin/pending
Get listings with `status: pending_review`. Supports `?page=` and `?limit=`.

### GET /admin/listings
Get all listings (all statuses). Supports `?page=` and `?limit=`.

### PUT /admin/listings/:id/approve
Approve a listing — sets status to `active`, sends email to owner.

### PUT /admin/listings/:id/reject
Reject a listing.

**Body:**
```json
{
  "reason": "string (optional)"
}
```

---

## 8. Wishlist Endpoints *(Protected)*

### GET /wishlist
Get current user's saved listings.

### POST /wishlist/:listingId
Add a listing to wishlist.

### DELETE /wishlist/:listingId
Remove a listing from wishlist.

---

## 9. Data Models

### Listing
```json
{
  "owner": "ObjectId (ref: User)",
  "brand": "string",
  "model": "string",
  "year": "number",
  "kmDriven": "number",
  "fuelType": "Petrol | Diesel | Electric | CNG | Hybrid",
  "transmission": "Manual | Automatic",
  "bodyType": "SUV | Sedan | Hatchback | Coupe | Convertible | Wagon",
  "location": "string",
  "pricePerDay": "number (required)",
  "availableFrom": "Date (optional)",
  "availableTo": "Date (optional)",
  "description": "string",
  "images": ["string"],
  "status": "active | pending_review | rented | rejected",
  "rejectionReason": "string | null"
}
```

### Booking
```json
{
  "listing": "ObjectId (ref: Listing)",
  "renter": "ObjectId (ref: User)",
  "owner": "ObjectId (ref: User)",
  "startDate": "Date",
  "endDate": "Date",
  "duration": "number (days)",
  "totalCost": "number",
  "status": "pending | confirmed | cancelled | completed",
  "message": "string"
}
```

### User
```json
{
  "name": "string",
  "email": "string",
  "role": "user | admin",
  "phone": "string",
  "savedListings": ["ObjectId"]
}
```
