const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getPendingListings,
  getFlaggedListings,
  approveListing,
  rejectListing,
  getAllListings
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Apply protection and restrict to 'admin' for all routes in this router
router.use(protect);
router.use(restrictTo('admin'));

// GET /api/admin/stats
router.get('/stats', getAdminStats);

// GET /api/admin/pending
router.get('/pending', getPendingListings);

// GET /api/admin/flagged
router.get('/flagged', getFlaggedListings);

// GET /api/admin/listings
router.get('/listings', getAllListings);

// PUT /api/admin/listings/:id/approve
router.put('/listings/:id/approve', approveListing);

// PUT /api/admin/listings/:id/reject
router.put('/listings/:id/reject', rejectListing);

module.exports = router;
