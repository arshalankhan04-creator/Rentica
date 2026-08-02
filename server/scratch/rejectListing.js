const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Listing = require('../models/Listing');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  // Find the latest listing created by our seller
  const listing = await Listing.findOne().sort({ createdAt: -1 });
  if (!listing) {
    console.error('No listings found in the database. Please create one first!');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Targeting listing: ${listing.brand} ${listing.model} (${listing._id})`);

  // Log in as admin via HTTP API
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  console.log(`Logging in as admin: ${adminEmail}...`);
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword })
  });

  if (!loginRes.ok) {
    const errText = await loginRes.text();
    console.error('Admin login failed:', errText);
    await mongoose.disconnect();
    process.exit(1);
  }

  const { token } = await loginRes.json();
  console.log('Logged in successfully. Token acquired.');

  // Call PUT /api/admin/listings/:id/reject
  const rejectReason = "Test rejection - price mismatch";
  console.log(`Calling PUT /api/admin/listings/${listing._id}/reject...`);
  
  const rejectRes = await fetch(`http://localhost:5000/api/admin/listings/${listing._id}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reason: rejectReason })
  });

  if (!rejectRes.ok) {
    const errText = await rejectRes.text();
    console.error('Listing rejection failed:', errText);
    await mongoose.disconnect();
    process.exit(1);
  }

  const updatedListing = await rejectRes.json();
  console.log('Listing rejected successfully. Response status:', rejectRes.status);

  // Verify DB state
  const verifiedListing = await Listing.findById(listing._id);
  console.log('Verified database status:', verifiedListing.status);
  console.log('Verified database rejection reason:', verifiedListing.rejectionReason);

  await mongoose.disconnect();
  console.log('Database disconnected.');
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
});
