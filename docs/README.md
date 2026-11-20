# Rentica Project Documentation

Welcome to the shared documentation for the Rentica car rental marketplace project.

## Project Layout

- `client/`: React frontend application.
- `server/`: Node/Express backend server.
- `docs/`: Shared documentation and API specifications.

## Core Concepts

### Domain Model
- **Owner**: A user who lists their car for rent.
- **Renter**: A user who books a car.
- **Listing**: A vehicle available for daily rental, with `pricePerDay`, optional availability dates, and standard vehicle specs.
- **Booking**: A rental reservation linking a renter, owner, and listing with start/end dates, duration, and total cost.

### Pricing
All vehicle prices are expressed as daily rates (`pricePerDay` in USD).

### Booking Flow
1. Renter browses listings and finds a vehicle.
2. Renter sends a booking request with start/end dates.
3. Owner receives an email notification and confirms or declines.
4. Status transitions: `pending` → `confirmed` → `completed` (or `cancelled`).
