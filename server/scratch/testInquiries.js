const testInquiries = async () => {
  const authUrl = 'http://localhost:5000/api/auth';
  const listingsUrl = 'http://localhost:5000/api/listings';
  const inquiriesUrl = 'http://localhost:5000/api/inquiries';

  const sellerAEmail = `seller_a_${Date.now()}@rentica.com`;
  const sellerBEmail = `seller_b_${Date.now()}@rentica.com`;
  const buyerEmail = `buyer_${Date.now()}@rentica.com`;
  const password = 'securepassword123';

  let sellerAToken, sellerBToken, buyerToken;
  let listingAId, listingBId;
  let threadId = '';

  console.log('--- STARTING INQUIRIES ENDPOINT VERIFICATION ---');

  // Setup: Users & Listings
  try {
    // Register users
    let res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Seller A', email: sellerAEmail, password, role: 'seller' })
    });
    let data = await res.json();
    sellerAToken = data.token;

    res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Seller B', email: sellerBEmail, password, role: 'seller' })
    });
    data = await res.json();
    sellerBToken = data.token;

    res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Buyer User', email: buyerEmail, password, role: 'buyer' })
    });
    data = await res.json();
    buyerToken = data.token;

    // Create Listing A (Seller A)
    res = await fetch(listingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({
        brand: 'BMW', model: '3 Series', year: 2018, kmDriven: 45000,
        fuelType: 'Diesel', transmission: 'Automatic', price: 3000000
      })
    });
    data = await res.json();
    listingAId = data._id;

    // Create Listing B (Seller B)
    res = await fetch(listingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerBToken}`
      },
      body: JSON.stringify({
        brand: 'Ford', model: 'Mustang', year: 2019, kmDriven: 15000,
        fuelType: 'Petrol', transmission: 'Automatic', price: 5000000
      })
    });
    data = await res.json();
    listingBId = data._id;

    console.log('Setup: Users and listings ready.');
  } catch (err) {
    console.error('Setup failed:', err);
    return;
  }

  // 1. Buyer creates inquiry on Listing A
  console.log('\n[TEST 1] Buyer creating inquiry on Listing A (should succeed 201)...');
  try {
    const res = await fetch(inquiriesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ listingId: listingAId, text: 'Hello, is this car still available?' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (res.status === 201 && data._id && data.messages.length === 1) {
      threadId = data._id;
      console.log('PASS - Inquiry created. Thread ID:', threadId);
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 2. Buyer sends second inquiry (should append to same thread, return 200)
  console.log('\n[TEST 2] Buyer sending second inquiry on same Listing A (should append to existing thread)...');
  try {
    const res = await fetch(inquiriesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ listingId: listingAId, text: 'Also, can I check it tomorrow?' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Messages Count: ${data.messages ? data.messages.length : 'N/A'}`);
    if (res.status === 200 && data._id === threadId && data.messages.length === 2) {
      console.log('PASS - Appended to same thread.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 3. Seller A tries to inquire on Listing A (should fail 400)
  console.log('\n[TEST 3] Seller A inquiring on own Listing A (should fail 400)...');
  try {
    const res = await fetch(inquiriesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({ listingId: listingAId, text: 'Testing self inquiry' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 400) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 4. Seller B inquires on Listing A (seller acting as buyer - should succeed 201)
  console.log('\n[TEST 4] Seller B inquiring on DIFFERENT Listing A (should succeed 201)...');
  try {
    const res = await fetch(inquiriesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerBToken}`
      },
      body: JSON.stringify({ listingId: listingAId, text: 'Hi, I am another seller interested in your BMW' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (res.status === 201 && data.buyer === data.messages[0].sender) {
      console.log('PASS - Seller B was allowed to act as buyer.');
      // Clean up Seller B's thread
      // (No delete route needed, we will leave it or ignore it)
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 5. GET /mine for Buyer
  console.log('\n[TEST 5] GET /mine for Buyer...');
  try {
    const res = await fetch(`${inquiriesUrl}/mine`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Threads: ${data.length}`);
    if (res.status === 200 && data.length === 1 && data[0].buyer.name === 'Buyer User') {
      console.log('PASS - Successfully fetched buyer threads.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 6. GET /mine for Seller A
  console.log('\n[TEST 6] GET /mine for Seller A...');
  try {
    const res = await fetch(`${inquiriesUrl}/mine`, {
      headers: { 'Authorization': `Bearer ${sellerAToken}` }
    });
    const data = await res.json();
    // Should have 2 threads: one from Buyer, one from Seller B
    console.log(`Status: ${res.status}, Threads: ${data.length}`);
    if (res.status === 200 && data.length === 2) {
      console.log('PASS - Successfully fetched seller threads.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 7. GET /:id with nonexistent valid ObjectId (should fail 404)
  console.log('\n[TEST 7] GET single thread with nonexistent ObjectId (should fail 404)...');
  try {
    const nonexistentId = '507f1f77bcf86cd799439011';
    const res = await fetch(`${inquiriesUrl}/${nonexistentId}`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 404) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 8. GET /:id with garbage string format (should fail 404)
  console.log('\n[TEST 8] GET single thread with garbage string ID (should fail 404)...');
  try {
    const res = await fetch(`${inquiriesUrl}/garbageid123`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 404) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 9. Authorized User GETs single thread
  console.log('\n[TEST 9] Buyer fetching single thread by ID...');
  try {
    const res = await fetch(`${inquiriesUrl}/${threadId}`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (res.status === 200 && data._id === threadId) {
      console.log('PASS - Thread details and full messages fetched.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 10. Unauthorized User GETs single thread (should fail 403)
  console.log('\n[TEST 10] Seller B fetching Buyer <-> Seller A thread (should fail 403)...');
  try {
    const res = await fetch(`${inquiriesUrl}/${threadId}`, {
      headers: { 'Authorization': `Bearer ${sellerBToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 403) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 11. Append message via POST /inquiries/:id/messages
  console.log('\n[TEST 11] Buyer posting message to existing thread...');
  try {
    const res = await fetch(`${inquiriesUrl}/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ text: 'Is there a discount?' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Messages Length: ${data.messages ? data.messages.length : 'N/A'}`);
    if (res.status === 200 && data.messages.length === 3) {
      console.log('PASS - Message appended.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 12. Unauthorized User posts message (should fail 403)
  console.log('\n[TEST 12] Seller B posting message to Buyer <-> Seller A thread (should fail 403)...');
  try {
    const res = await fetch(`${inquiriesUrl}/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerBToken}`
      },
      body: JSON.stringify({ text: 'Unwelcome hijack message' })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 403) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  console.log('\n--- VERIFICATION COMPLETE ---');
};

testInquiries();

