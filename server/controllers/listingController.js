const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Listing = require('../models/Listing');
const { sendUnderReviewEmail } = require('../utils/sendEmail');

// Helper to delete physical files
const deletePhysicalFiles = (files) => {
  if (!files || files.length === 0) return;
  files.forEach(filePath => {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (e) {
      console.error('Failed to delete physical file:', filePath, e.message);
    }
  });
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (Seller only)
const createListing = async (req, res, next) => {
  const uploadedFiles = req.files ? req.files.map(file => `uploads/${file.filename}`) : [];
  try {
    const {
      brand,
      model,
      year,
      kmDriven,
      fuelType,
      transmission,
      bodyType,
      location,
      price,
      description
    } = req.body;

    // Validate required fields
    if (!brand || !model || !year || !kmDriven || !fuelType || !transmission || !bodyType || !location || price === undefined) {
      deletePhysicalFiles(uploadedFiles);
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate enums
    if (!['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'].includes(fuelType)) {
      deletePhysicalFiles(uploadedFiles);
      return res.status(400).json({ message: 'Invalid fuel type' });
    }

    if (!['Manual', 'Automatic'].includes(transmission)) {
      deletePhysicalFiles(uploadedFiles);
      return res.status(400).json({ message: 'Invalid transmission type' });
    }

    if (!['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'Wagon'].includes(bodyType)) {
      deletePhysicalFiles(uploadedFiles);
      return res.status(400).json({ message: 'Invalid body type' });
    }

    const numYear = Number(year);
    const numKm = Number(kmDriven);
    const numPrice = Number(price);

    const initialStatus = 'pending_review';

    const listing = await Listing.create({
      seller: req.user.id,
      brand,
      model,
      year: numYear,
      kmDriven: numKm,
      fuelType,
      transmission,
      bodyType,
      location,
      price: numPrice,
      description,
      images: uploadedFiles,
      status: initialStatus
    });

    // Trigger email notification if listing is sent to Awaiting Review queue
    if (initialStatus === 'pending_review' && req.user && req.user.email) {
      sendUnderReviewEmail(req.user.email, req.user.name, `${brand} ${model}`, []);
    }

    res.status(201).json(listing);
  } catch (error) {
    deletePhysicalFiles(uploadedFiles);
    next(error);
  }
};

// @desc    Get all listings (with search, filter, sort)
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    const queryObj = {};

    // Filtering
    if (req.query.brand) {
      queryObj.brand = { $regex: req.query.brand, $options: 'i' };
    }
    if (req.query.bodyType) {
      queryObj.bodyType = { $regex: req.query.bodyType, $options: 'i' };
    }
    if (req.query.location) {
      queryObj.location = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.minYear || req.query.maxYear) {
      queryObj.year = {};
      if (req.query.minYear) {
        queryObj.year.$gte = Number(req.query.minYear);
      }
      if (req.query.maxYear) {
        queryObj.year.$lte = Number(req.query.maxYear);
      }
    } else if (req.query.year) {
      queryObj.year = Number(req.query.year);
    }

    if (req.query.fuelType) {
      const validFuels = ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];
      const fuelTypes = req.query.fuelType
        .split(',')
        .map(f => f.trim())
        .filter(f => f && validFuels.includes(f));

      if (fuelTypes.length > 0) {
        queryObj.fuelType = { $in: fuelTypes };
      }
    }
    
    // Price range filtering
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) {
        queryObj.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        queryObj.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Trust Score and Risk Flag filtering
    if (req.query.minTrustScore) {
      queryObj.trustScore = { $gte: Number(req.query.minTrustScore) };
    }
    if (req.query.riskFlag) {
      queryObj.riskFlag = req.query.riskFlag;
    }

    // By default, public GET listings should show active listings
    queryObj.status = 'active';

    let query = Listing.find(queryObj);

    // Sorting
    if (req.query.sort) {
      if (req.query.sort === 'price') {
        query = query.sort({ price: 1, createdAt: -1 });
      } else if (req.query.sort === '-price') {
        query = query.sort({ price: -1, createdAt: -1 });
      } else if (req.query.sort === 'trustScore') {
        query = query.sort({ trustScore: -1, createdAt: -1 });
      } else if (req.query.sort === 'createdAt') {
        query = query.sort({ createdAt: 1 });
      } else {
        // Includes '-createdAt'
        query = query.sort({ createdAt: -1 });
      }
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const listings = await query.populate('seller', 'name');
    res.json(listings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(id).populate('seller', 'name');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listingObj = listing.toObject();
    if (listingObj.seller && listingObj.seller._id) {
      const sellerId = listingObj.seller._id;
      const [listedCount, soldCount] = await Promise.all([
        Listing.countDocuments({ seller: sellerId }),
        Listing.countDocuments({ seller: sellerId, status: 'sold' })
      ]);
      listingObj.seller.listedCount = listedCount;
      listingObj.seller.soldCount = soldCount;
    }

    res.json(listingObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private (Owner only)
const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ownership check
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const {
      brand,
      model,
      year,
      kmDriven,
      fuelType,
      transmission,
      bodyType,
      location,
      price,
      description,
      status
    } = req.body;

    // Update fields if provided
    if (brand) listing.brand = brand;
    if (model) listing.model = model;
    if (year) listing.year = Number(year);
    if (kmDriven) listing.kmDriven = Number(kmDriven);
    if (fuelType) {
      if (!['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'].includes(fuelType)) {
        return res.status(400).json({ message: 'Invalid fuel type' });
      }
      listing.fuelType = fuelType;
    }
    if (transmission) {
      if (!['Manual', 'Automatic'].includes(transmission)) {
        return res.status(400).json({ message: 'Invalid transmission type' });
      }
      listing.transmission = transmission;
    }
    if (bodyType) {
      if (!['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'Wagon'].includes(bodyType)) {
        return res.status(400).json({ message: 'Invalid body type' });
      }
      listing.bodyType = bodyType;
    }
    if (location) listing.location = location;
    if (price !== undefined) listing.price = Number(price);
    if (description !== undefined) listing.description = description;
    if (status) {
      if (!['active', 'pending_review', 'sold', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      listing.status = status;
    }

    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (Owner only)
const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ownership check
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Delete associated physical files
    deletePhysicalFiles(listing.images);

    await Listing.findByIdAndDelete(id);
    res.json({ message: 'Listing removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in seller's listings
// @route   GET /api/listings/mine
// @access  Private (Seller only)
const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    next(error);
  }
};

// @desc    Add images to an existing listing
// @route   POST /api/listings/:id/images
// @access  Private (Owner only)
const addListingImages = async (req, res, next) => {
  const uploadedFiles = req.files ? req.files.map(file => `uploads/${file.filename}`) : [];
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      deletePhysicalFiles(uploadedFiles);
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      deletePhysicalFiles(uploadedFiles);
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ownership check
    if (listing.seller.toString() !== req.user.id) {
      deletePhysicalFiles(uploadedFiles);
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    if (uploadedFiles.length === 0) {
      return res.status(400).json({ message: 'Please select files to upload' });
    }

    // Enforce limits
    if (listing.images.length + uploadedFiles.length > 15) {
      deletePhysicalFiles(uploadedFiles);
      return res.status(400).json({ message: 'Upload failed. Max of 15 images allowed per listing' });
    }

    listing.images.push(...uploadedFiles);
    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error) {
    deletePhysicalFiles(uploadedFiles);
    next(error);
  }
};

// @desc    Remove a single image from a listing
// @route   DELETE /api/listings/:id/images/:imageIndex
// @access  Private (Owner only)
const deleteListingImage = async (req, res, next) => {
  try {
    const { id, imageIndex } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ownership check
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this listing' });
    }

    const index = parseInt(imageIndex);
    if (isNaN(index) || index < 0 || index >= listing.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    const imagePath = listing.images[index];

    // Splice listing image out
    listing.images.splice(index, 1);
    await listing.save();

    // Delete physical file
    deletePhysicalFiles([imagePath]);

    res.json({ message: 'Image removed successfully', listing });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  addListingImages,
  deleteListingImage
};
