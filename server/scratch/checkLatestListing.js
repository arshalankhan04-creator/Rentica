const mongoose = require('mongoose');
const Listing = require('../models/Listing');

mongoose.connect('mongodb://localhost:27017/valora_anti')
  .then(async () => {
    const listing = await Listing.findOne().sort({ createdAt: -1 });
    console.log('Latest listing:');
    console.log('ID:', listing?._id);
    console.log('Brand/Model:', listing?.brand, listing?.model);
    console.log('Images array:', listing?.images);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
