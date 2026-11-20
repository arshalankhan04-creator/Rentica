# Walkthrough — Rentica Server Implementation

Rentica is converted from Valora (used-car marketplace) into a car rental marketplace. This document describes the implemented phases.

## Phase A: Authentication

JWT-based authentication with role-based access control.

- `server/middleware/auth.js` — `protect` middleware verifies bearer token, attaches user to `req.user`.
- `server/middleware/role.js` — `restrictTo(...roles)` limits route access by user role (`renter`, `owner`, `admin`).
- `server/controllers/authController.js` — `registerUser`, `loginUser`, `getUserProfile`.
- `server/routes/authRoutes.js` — `/register`, `/login`, `/me`.

---

## Phase B: Listing CRUD

Car rental listings with daily pricing.

- `server/models/Listing.js` — fields: `owner`, `brand`, `model`, `year`, `kmDriven`, `fuelType`, `transmission`, `bodyType`, `location`, `pricePerDay`, `availableFrom`, `availableTo`, `description`, `images`, `status`, `rejectionReason`.
- `server/controllers/listingController.js` — `createListing`, `getListings`, `getListingById`, `updateListing`, `deleteListing`, `getMyListings`, `addListingImages`, `deleteListingImage`.
- Image uploads via Multer, served from `/uploads`.

---

## Phase C: Booking System

Renters can request rentals from owners.

- `server/models/Booking.js` — fields: `listing`, `renter`, `owner`, `startDate`, `endDate`, `duration`, `totalCost`, `status`, `message`.
- `server/controllers/bookingController.js` — `createBooking`, `getBookings`, `getBookingById`, `updateBookingStatus`.
- `server/routes/bookingRoutes.js` — `/api/bookings`.
- Status flow: `pending` → `confirmed` → `completed` or `cancelled`.

---

## Phase D: Admin Panel

Admin moderation for listing approval.

- `server/controllers/adminController.js` — `getAdminStats`, `getPendingListings`, `approveListing`, `rejectListing`, `getAllListings`.
- `server/routes/adminRoutes.js` — all routes protected with `admin` role.

---

## Phase E: Email Notifications

Gmail SMTP notifications via Nodemailer.

- Booking request notification to owner on new booking.
- Listing approval/rejection emails from admin.
- Under-review email when new listing is submitted.

---

## Seed Data

- `server/seed.js` — creates 6 users and 15 rental listings with `pricePerDay` values ranging from $35/day (Hatchback) to $250/day (Porsche 911).
- `server/scripts/seedAdmin.js` — creates/updates admin user from `.env` credentials.
