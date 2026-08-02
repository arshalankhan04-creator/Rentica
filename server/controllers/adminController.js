const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { sendListingApprovedEmail, sendListingRejectedEmail } = require('../utils/sendEmail');

// @desc    Get Admin Metrics Stats (Active listings, total users, awaiting review, flagged risk)
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res, next) => {
  try {
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments({});
    const awaitingReview = await Listing.countDocuments({ status: 'pending_review' });
    const flaggedRisk = await Listing.countDocuments({ riskFlag: { $in: ['High', 'Medium'] } });

    res.json({
      activeListings,
      totalUsers,
      awaitingReview,
      flaggedRisk
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
      .populate('seller', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get flagged listings queue (riskFlag is High or Medium)
// @route   GET /api/admin/flagged
// @access  Private (Admin only)
const getFlaggedListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const listings = await Listing.find({
      riskFlag: { $in: ['High', 'Medium'] }
    })
      .populate('seller', 'name email')
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

    const listing = await Listing.findById(id).populate('seller', 'name email');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status === 'active') {
      return res.status(400).json({ message: 'Listing is already active' });
    }
    if (listing.status === 'sold') {
      return res.status(400).json({ message: 'Cannot approve a sold listing' });
    }

    listing.status = 'active';
    listing.rejectionReason = null;
    listing.reviewedBy = req.user ? req.user._id : null;
    listing.reviewedAt = new Date();
    await listing.save();

    // Trigger email notification
    if (listing.seller && listing.seller.email) {
      sendListingApprovedEmail(listing.seller.email, listing.seller.name, `${listing.brand} ${listing.model}`);
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

    const listing = await Listing.findById(id).populate('seller', 'name email');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status === 'rejected') {
      return res.status(400).json({ message: 'Listing is already rejected' });
    }
    if (listing.status === 'sold') {
      return res.status(400).json({ message: 'Cannot reject a sold listing' });
    }

    const { reason } = req.body;
    listing.status = 'rejected';
    listing.rejectionReason = reason || null;
    listing.reviewedBy = req.user ? req.user._id : null;
    listing.reviewedAt = new Date();
    await listing.save();

    // Trigger email notification
    if (listing.seller && listing.seller.email) {
      sendListingRejectedEmail(listing.seller.email, listing.seller.name, `${listing.brand} ${listing.model}`, reason);
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
      .populate('seller', 'name email')
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
  getFlaggedListings,
  approveListing,
  rejectListing,
  getAllListings
};
