const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Listing = require('../models/Listing');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testAdmin = async () => {
  const authUrl = 'http://localhost:5000/api/auth';
  const listingsUrl = 'http://localhost:5000/api/listings';
  const adminUrl = 'http://localhost:5000/api/admin';

  const sellerEmail = `seller_admin_${Date.now()}@rentica.com`;
  const buyerEmail = `buyer_admin_${Date.now()}@rentica.com`;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const password = 'securepassword123';

  let sellerToken, buyerToken, adminToken;
  let listing1Id, listing2Id, listing3Id;

  console.log('--- STARTING ADMIN PANEL ENDPOINT VERIFICATION ---');

  // Setup: Users
  try {
    // Register Seller & Buyer
    let res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Panel Seller', email: sellerEmail, password, role: 'seller' })
    });
    let data = await res.json();
    sellerToken = data.token;

    res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Panel Buyer', email: buyerEmail, password, role: 'buyer' })
    });
    data = await res.json();
    buyerToken = data.token;

    // Log in Admin
    res = await fetch(`${authUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    data = await res.json();
    adminToken = data.token;

    // Create 3 listings as Seller
    const createListing = async (brand, model, price) => {
      const cres = await fetch(listingsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify({
          brand, model, year: 2021, kmDriven: 20000,
          fuelType: 'Petrol', transmission: 'Automatic', price
        })
      });
      const cdata = await cres.json();
      return cdata._id;
    };

    listing1Id = await createListing('Toyota', 'Camry', 2500000);
    listing2Id = await createListing('Mercedes', 'C-Class', 6000000);
    listing3Id = await createListing('Honda', 'Civic', 1200000);

    // Modify status/riskFlag directly via Mongoose for setup
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rentica_anti');
    
    // Listing 1: pending_review
    await Listing.findByIdAndUpdate(listing1Id, { status: 'pending_review' });
    // Listing 2: active, riskFlag High
    await Listing.findByIdAndUpdate(listing2Id, { status: 'active', riskFlag: 'High' });
    // Listing 3: remains active, riskFlag Low/null
    await Listing.findByIdAndUpdate(listing3Id, { status: 'active', riskFlag: 'Low' });

    await mongoose.connection.close();
    console.log('Setup: Users, listings, and flagged statuses initialized.');
  } catch (err) {
    console.error('Setup failed:', err);
    return;
  }

  // 1. Role Guards check (Buyer and Seller should receive 403)
  console.log('\n[TEST 1] Buyer calling GET /api/admin/flagged (should fail 403)...');
  try {
    const res = await fetch(`${adminUrl}/flagged`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    console.log(`Status: ${res.status}`);
    if (res.status === 403) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  console.log('\n[TEST 2] Seller calling GET /api/admin/listings (should fail 403)...');
  try {
    const res = await fetch(`${adminUrl}/listings`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    console.log(`Status: ${res.status}`);
    if (res.status === 403) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 2. Admin fetches flagged listings queue
  console.log('\n[TEST 3] Admin fetching flagged queue (should succeed 200 and return Listing 1 & 2 only)...');
  try {
    const res = await fetch(`${adminUrl}/flagged`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Count: ${data.length}`);
    
    const ids = data.map(item => item._id);
    const hasListing1 = ids.includes(listing1Id);
    const hasListing2 = ids.includes(listing2Id);
    const hasListing3 = ids.includes(listing3Id);
    const sellerPopulated = data.every(item => item.seller && item.seller.name && item.seller.email);

    console.log('Returned Listing 1 (pending_review):', hasListing1 ? 'YES' : 'NO');
    console.log('Returned Listing 2 (riskFlag High):', hasListing2 ? 'YES' : 'NO');
    console.log('Returned Listing 3 (active & Low):', hasListing3 ? 'YES' : 'NO');
    console.log('Seller name and email populated:', sellerPopulated ? 'YES' : 'NO');

    if (res.status === 200 && hasListing1 && hasListing2 && !hasListing3 && sellerPopulated) {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 3. Admin flagged queue pagination check
  console.log('\n[TEST 4] Admin fetching flagged queue with pagination (?limit=1)...');
  try {
    const res = await fetch(`${adminUrl}/flagged?limit=1`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Returned Count: ${data.length}`);
    if (res.status === 200 && data.length === 1) {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 4. Admin approves Listing 1 (should set status to active)
  console.log('\n[TEST 5] Admin approving Listing 1 (pending_review)...');
  try {
    const res = await fetch(`${adminUrl}/listings/${listing1Id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, New Status: ${data.status}, RejectionReason: ${data.rejectionReason}`);
    if (res.status === 200 && data.status === 'active' && data.rejectionReason === null) {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 5. Admin approves Listing 1 again (should fail 400)
  console.log('\n[TEST 6] Admin approving Listing 1 again (should fail 400)...');
  try {
    const res = await fetch(`${adminUrl}/listings/${listing1Id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 400) {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 6. Admin rejects Listing 2 (should set status to rejected and store reason)
  console.log('\n[TEST 7] Admin rejecting Listing 2 with reason...');
  try {
    const res = await fetch(`${adminUrl}/listings/${listing2Id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ reason: 'Suspiciously high risk flag' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, New Status: ${data.status}, RejectionReason: "${data.rejectionReason}"`);
    if (res.status === 200 && data.status === 'rejected' && data.rejectionReason === 'Suspiciously high risk flag') {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 7. Admin rejects Listing 2 again (should fail 400)
  console.log('\n[TEST 8] Admin rejecting Listing 2 again (should fail 400)...');
  try {
    const res = await fetch(`${adminUrl}/listings/${listing2Id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ reason: 'Duplicate reject attempt' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 400) {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 8. Admin fetches all listings (active, pending_review, rejected)
  console.log('\n[TEST 9] Admin fetching all listings...');
  try {
    const res = await fetch(`${adminUrl}/listings`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Total count: ${data.length}`);
    const ids = data.map(item => item._id);
    const hasAll = ids.includes(listing1Id) && ids.includes(listing2Id) && ids.includes(listing3Id);
    if (res.status === 200 && hasAll) {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 9. Error handling nonexistent or malformed ObjectId on approve/reject
  console.log('\n[TEST 10a] Admin approving with garbage string ID (should fail 404)...');
  try {
    const res = await fetch(`${adminUrl}/listings/garbageid123/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 404) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  console.log('\n[TEST 10b] Admin approving with nonexistent valid ObjectId (should fail 404)...');
  try {
    const nonexistentId = '507f1f77bcf86cd799439011';
    const res = await fetch(`${adminUrl}/listings/${nonexistentId}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 404) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // Cleanup testing listings
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rentica');
    await Listing.findByIdAndDelete(listing1Id);
    await Listing.findByIdAndDelete(listing2Id);
    await Listing.findByIdAndDelete(listing3Id);
    await mongoose.connection.close();
    console.log('\nCleanup completed.');
  } catch (e) {}

  console.log('\n--- VERIFICATION COMPLETE ---');
};

testAdmin();

