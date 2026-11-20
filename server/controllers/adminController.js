const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { sendListingApprovedEmail, sendListingRejectedEmail } = require('../utils/sendEmail');

// @desc    Get Admin Metrics Stats (Active listings, total users, awaiting review)
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res, next) => {
  try {
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments({});
    const awaitingReview = await Listing.countDocuments({ status: 'pending_review' });

    res.json({
      activeListings,
      totalUsers,
      awaitingReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending review queue (status is pending_review)
// @route   GET /api/admin/pending
// @access  Private (Admin only)
const getPendingListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const listings = await Listing.find({ status: 'pending_review' })
      .populate('owner', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve listing (set status to active)
// @route   PUT /api/admin/listings/:id/approve
// @access  Private (Admin only)
const approveListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(id).populate('owner', 'name email');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status === 'active') {
      return res.status(400).json({ message: 'Listing is already active' });
    }
    if (listing.status === 'rented') {
      return res.status(400).json({ message: 'Cannot approve a rented listing' });
    }

    listing.status = 'active';
    listing.rejectionReason = null;
    listing.reviewedBy = req.user ? req.user._id : null;
    listing.reviewedAt = new Date();
    await listing.save();

    // Trigger email notification
    if (listing.owner && listing.owner.email) {
      sendListingApprovedEmail(listing.owner.email, listing.owner.name, `${listing.brand} ${listing.model}`);
    }

    res.json(listing);
  } catch (error) {
    next(error);
  }
};

// @desc    Reject listing (set status to rejected, with optional reason)
// @route   PUT /api/admin/listings/:id/reject
// @access  Private (Admin only)
const rejectListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(id).populate('owner', 'name email');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status === 'rejected') {
      return res.status(400).json({ message: 'Listing is already rejected' });
    }
    if (listing.status === 'rented') {
      return res.status(400).json({ message: 'Cannot reject a rented listing' });
    }

    const { reason } = req.body;
    listing.status = 'rejected';
    listing.rejectionReason = reason || null;
    listing.reviewedBy = req.user ? req.user._id : null;
    listing.reviewedAt = new Date();
    await listing.save();

    // Trigger email notification
    if (listing.owner && listing.owner.email) {
      sendListingRejectedEmail(listing.owner.email, listing.owner.name, `${listing.brand} ${listing.model}`, reason);
    }

    res.json(listing);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings for admin oversight
// @route   GET /api/admin/listings
// @access  Private (Admin only)
const getAllListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const listings = await Listing.find({})
      .populate('owner', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getPendingListings,
  approveListing,
  rejectListing,
  getAllListings
};
