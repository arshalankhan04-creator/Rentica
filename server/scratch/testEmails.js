const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testEmails = async () => {
  const authUrl = 'http://localhost:5000/api/auth';
  const listingsUrl = 'http://localhost:5000/api/listings';
  const inquiriesUrl = 'http://localhost:5000/api/inquiries';

  const sellerEmail = process.env.EMAIL_USER;
  const buyerEmail = `buyer_email_${Date.now()}@valora.com`;
  const password = 'securepassword123';

  let sellerToken, buyerToken;
  let listing1Id;

  console.log('--- STARTING GMAIL NOTIFICATION INTEGRATION TEST ---');
  console.log(`Seller Email (Target Inbox): ${sellerEmail}`);

  if (!sellerEmail) {
    console.error('Error: EMAIL_USER is not defined in your .env file.');
    return;
  }

  // Setup: Database cleanup and Users/Listings
  try {
    // Connect directly to DB to clean up any user with this email so registration succeeds
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/valora');
    await User.deleteMany({ email: sellerEmail.toLowerCase() });
    await mongoose.connection.close();
    console.log('Database cleaned up for target seller email.');

    // Register Seller
    let res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Gmail Seller', email: sellerEmail, password, role: 'seller' })
    });
    let data = await res.json();
    sellerToken = data.token;

    // Register Buyer
    res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Valora Buyer', email: buyerEmail, password, role: 'buyer' })
    });
    data = await res.json();
    buyerToken = data.token;

    // Create Listing 1 (Seller)
    res = await fetch(listingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        brand: 'Audi', model: 'A6', year: 2020, kmDriven: 25000,
        fuelType: 'Diesel', transmission: 'Automatic', price: 4500000
      })
    });
    data = await res.json();
    listing1Id = data._id;

    console.log('Setup: Test users and listing created.');
  } catch (err) {
    console.error('Setup failed:', err);
    return;
  }

  // 1. Buyer creates inquiry on Listing 1 (First contact -> should trigger email)
  console.log('\n[TEST] Buyer creating NEW inquiry on Listing 1 (should succeed 201 & trigger email)...');
  try {
    const res = await fetch(inquiriesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ listingId: listing1Id, text: 'Hello, is this Audi A6 still available? I would like to schedule a viewing.' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (res.status === 201 && data._id) {
      console.log('PASS - Inquiry created successfully. Email dispatch initiated.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  console.log('\n--- VERIFICATION INITIATED ---');
};

testEmails();
