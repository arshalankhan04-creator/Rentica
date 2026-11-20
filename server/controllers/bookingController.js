const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Renters)
const createBooking = async (req, res, next) => {
  try {
    const { listingId, startDate, endDate, message } = req.body;

    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide listing ID, start date, and end date' });
    }

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(listingId).populate('owner', 'name email');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Prevent owner from booking their own listing
    if (listing.owner._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot book your own listing' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalCost = listing.pricePerDay * duration;

    const booking = await Booking.create({
      listing: listingId,
      renter: req.user.id,
      owner: listing.owner._id,
      startDate: start,
      endDate: end,
      duration,
      totalCost,
      message: message || '',
      status: 'pending'
    });

    // Send email notification to owner asynchronously (non-blocking)
    const sendNotification = async () => {
      try {
        const renterName = req.user.name || 'A renter';
        await sendEmail({
          to: listing.owner.email,
          subject: `Rentica - New Booking Request for your ${listing.brand} ${listing.model}`,
          text: `Hello ${listing.owner.name},\n\nYou have received a new booking request from ${renterName} for your vehicle listing: ${listing.brand} ${listing.model}.\n\nRental Period: ${start.toDateString()} to ${end.toDateString()} (${duration} days)\nTotal Cost: $${totalCost}\n\nPlease log in to the Rentica app to confirm or decline this booking.\n\nBest regards,\nThe Rentica Team`
        });
        console.log(`Booking notification email sent to ${listing.owner.email} successfully.`);
      } catch (err) {
        console.error('Nodemailer Error: Failed to send booking notification email:', err.message);
      }
    };
    sendNotification();

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings (role-aware)
// @route   GET /api/bookings/mine
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      // Admin sees all bookings
    } else {
      // Standard user sees bookings where they are renter or owner
      query.$or = [{ renter: req.user.id }, { owner: req.user.id }];
    }

    const bookings = await Booking.find(query)
      .populate('listing', 'brand model pricePerDay images description')
      .populate('renter', 'name')
      .populate('owner', 'name')
      .sort({ updatedAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Booking participants only)
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = await Booking.findById(id)
      .populate('listing', 'brand model pricePerDay images description')
      .populate('renter', 'name')
      .populate('owner', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Access check: only renter or owner can view
    const isRenter = booking.renter._id.toString() === req.user.id;
    const isOwner = booking.owner._id.toString() === req.user.id;

    if (!isRenter && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner or Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isOwner = booking.owner.toString() === req.user.id;
    const isRenter = booking.renter.toString() === req.user.id;

    if (!isOwner && !isRenter && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus
};
