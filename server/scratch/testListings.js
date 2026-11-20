const testListings = async () => {
  const authUrl = 'http://localhost:5000/api/auth';
  const listingsUrl = 'http://localhost:5000/api/listings';

  const sellerEmail = `seller_${Date.now()}@rentica.com`;
  const buyerEmail = `buyer_${Date.now()}@rentica.com`;
  const password = 'securepassword123';

  let sellerToken = '';
  let buyerToken = '';
  let listingId1 = '';
  let listingId2 = '';

  console.log('--- STARTING LISTINGS ENDPOINT VERIFICATION ---');

  // Setup: Register buyer and seller
  try {
    // 1. Register Seller
    let res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Seller User', email: sellerEmail, password, role: 'seller' })
    });
    let data = await res.json();
    sellerToken = data.token;

    // 2. Register Buyer
    res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Buyer User', email: buyerEmail, password, role: 'buyer' })
    });
    data = await res.json();
    buyerToken = data.token;

    console.log('Setup: Test users created successfully.');
  } catch (err) {
    console.error('Setup failed:', err);
    return;
  }

  // 1. Test POST /listings as buyer (should fail 403)
  console.log('\n[TEST 1] Creating listing as buyer (should fail 403)...');
  try {
    const res = await fetch(listingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        kmDriven: 50000,
        fuelType: 'Petrol',
        transmission: 'Manual',
        price: 1500000
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 403) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 2. Test POST /listings with missing fields (should fail 400)
  console.log('\n[TEST 2] Creating listing with missing fields (should fail 400)...');
  try {
    const res = await fetch(listingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        brand: 'Honda',
        model: 'Civic'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 400) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 3. Test POST /listings with invalid enum values (should fail 400)
  console.log('\n[TEST 3] Creating listing with invalid transmission (should fail 400)...');
  try {
    const res = await fetch(listingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        kmDriven: 50000,
        fuelType: 'Petrol',
        transmission: 'InvalidTransmission',
        price: 1500000
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 400) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 4. Test valid POST /listings (should pass 210)
  console.log('\n[TEST 4] Creating valid listing 1...');
  try {
    const res = await fetch(listingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        kmDriven: 50000,
        fuelType: 'Petrol',
        transmission: 'Manual',
        price: 1500000,
        description: 'Excellent condition sedan'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (res.status === 201 && data._id) {
      listingId1 = data._id;
      console.log('PASS - Listing 1 created. ID:', listingId1);
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 5. Create listing 2 (for search verification)
  console.log('\n[TEST 5] Creating listing 2 (Toyota)...');
  try {
    const res = await fetch(listingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        brand: 'Toyota',
        model: 'Corolla',
        year: 2021,
        kmDriven: 20000,
        fuelType: 'Hybrid',
        transmission: 'Automatic',
        price: 2500000,
        description: 'Fuel efficient hybrid'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (res.status === 201 && data._id) {
      listingId2 = data._id;
      console.log('PASS - Listing 2 created. ID:', listingId2);
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 6. Test public GET /listings (and search/filter)
  console.log('\n[TEST 6] GET /listings with brand filter (brand=Toyota)...');
  try {
    const res = await fetch(`${listingsUrl}?brand=Toyota`);
    const data = await res.json();
    console.log(`Status: ${res.status}, Length: ${data.length}`);
    if (res.status === 200 && data.length > 0 && data.every(l => l.brand.toLowerCase().includes('toyota'))) {
      console.log('PASS - Successfully filtered by brand.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 7. Test price range filtering
  console.log('\n[TEST 7] GET /listings with price range filter (minPrice=2000000)...');
  try {
    const res = await fetch(`${listingsUrl}?minPrice=2000000`);
    const data = await res.json();
    console.log(`Status: ${res.status}, Length: ${data.length}`);
    if (res.status === 200 && data.length > 0 && data.every(l => l.price >= 2000000)) {
      console.log('PASS - Successfully filtered by minPrice.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 8. Test GET /listings/mine (private listings)
  console.log('\n[TEST 8] GET /listings/mine for authenticated seller...');
  try {
    const res = await fetch(`${listingsUrl}/mine`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Length: ${data.length}`);
    if (res.status === 200 && data.length === 2) {
      console.log('PASS - Returned only owner\'s 2 listings.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 9. Test GET /listings/:id
  console.log('\n[TEST 9] GET single listing by ID with populated seller...');
  try {
    const res = await fetch(`${listingsUrl}/${listingId1}`);
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (res.status === 200 && data.seller && data.seller.name === 'Seller User') {
      console.log('PASS - Populated seller name:', data.seller.name);
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 10a. Test invalid ID format (clean 404 validation for garbage string)
  console.log('\n[TEST 10a] GET listing with invalid ID format garbage string (should fail 404)...');
  try {
    const res = await fetch(`${listingsUrl}/invalidid123`);
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 404) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 10b. Test valid ID format but nonexistent ObjectId (clean 404 validation)
  console.log('\n[TEST 10b] GET listing with valid ID format but nonexistent ObjectId (should fail 404)...');
  try {
    const nonexistentId = '507f1f77bcf86cd799439011'; // well-formed but does not exist
    const res = await fetch(`${listingsUrl}/${nonexistentId}`);
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 404) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }


  // 11. Test PUT update as non-owner (should fail 403)
  console.log('\n[TEST 11] Updating listing as non-owner (should fail 403)...');
  try {
    const res = await fetch(`${listingsUrl}/${listingId1}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ description: 'Hacked description' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 403) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 12. Test PUT update as owner
  console.log('\n[TEST 12] Updating listing as owner (should pass)...');
  try {
    const newDescription = 'Updated description by owner';
    const res = await fetch(`${listingsUrl}/${listingId1}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({ description: newDescription })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (res.status === 200 && data.description === newDescription) {
      console.log('PASS - Listing updated successfully.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 13. Test DELETE as non-owner (should fail 403)
  console.log('\n[TEST 13] Deleting listing as non-owner (should fail 403)...');
  try {
    const res = await fetch(`${listingsUrl}/${listingId1}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 403) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 14. Test DELETE as owner
  console.log('\n[TEST 14] Deleting listing as owner (should pass)...');
  try {
    const res = await fetch(`${listingsUrl}/${listingId1}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 200) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 15. Verify listing is gone
  console.log('\n[TEST 15] Fetching deleted listing (should fail 404)...');
  try {
    const res = await fetch(`${listingsUrl}/${listingId1}`);
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 404) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 16. Test GET /listings with brand filter that matches nothing
  console.log('\n[TEST 16] GET /listings with non-matching brand filter (brand=Ferrari)...');
  try {
    const res = await fetch(`${listingsUrl}?brand=Ferrari`);
    const data = await res.json();
    console.log(`Status: ${res.status}, Length: ${data.length}`);
    if (res.status === 200 && Array.isArray(data) && data.length === 0) {
      console.log('PASS - Successfully returned status 200 with an empty array.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  console.log('\n--- VERIFICATION COMPLETE ---');
};

testListings();

