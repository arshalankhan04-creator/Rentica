const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// All routes in this router require authentication
router.use(protect);

// GET /mine (must be defined BEFORE /:id)
router.get('/mine', getBookings);

// POST /
router.route('/')
  .post(createBooking);

// GET /:id
router.route('/:id')
  .get(getBookingById);

// PUT /:id/status
router.route('/:id/status')
  .put(updateBookingStatus);

module.exports = router;
