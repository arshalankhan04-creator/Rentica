# Rentica — Car Rental Marketplace

**Live:** [rentica.vercel.app](https://rentica.vercel.app) &nbsp;|&nbsp; **API:** [rentica-server.onrender.com](https://rentica-server.onrender.com)

Rentica is a full-stack car rental marketplace built with React, Node/Express, and MongoDB. It connects car owners with renters, providing a seamless booking experience with daily pricing, availability management, and direct owner-renter communication.

## Project Structure

```
rentica/
├── client/          # React frontend application
├── server/          # Node/Express backend API
├── docs/            # Documentation and API specifications
└── README.md        # This file
```

## Services Overview

### 1. Client (`client/`)
A React-based user interface built with Vite, Tailwind CSS, and Framer Motion. Features include:
- Browse rental listings by category, brand, location, and price
- Book vehicles with daily pricing
- Owner and renter dashboards
- Wishlist and vehicle comparison

### 2. Server (`server/`)
A Node/Express REST API that handles authentication, listing management, booking requests, and admin moderation.

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB 6+

### Server Setup
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm install
node seed.js          # Optional: seed sample data
npm run seed:admin    # Create admin user from .env credentials
npm start
```

### Client Setup
```bash
cd client
npm install
npm run dev
```

## Key Features
- Car rental listings with daily pricing (`pricePerDay`)
- Availability date range per vehicle
- Booking system with status tracking (pending → confirmed → completed)
- Owner/renter role-based access
- Admin moderation panel for listing approval
- Image upload for vehicle listings
- Email notifications for booking requests

## API Endpoints
See `docs/Rentica_Spec_APIs.md` for the full API reference.
