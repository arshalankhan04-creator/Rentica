const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testAdminAuth = async () => {
  const loginUrl = 'http://localhost:5000/api/auth/login';
  const meUrl = 'http://localhost:5000/api/auth/me';

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be defined in your .env file.');
    return;
  }

  console.log('--- STARTING ADMIN AUTHENTICATION SANITY CHECK ---');
  console.log(`Using email: ${email}`);

  try {
    // 1. Login request
    console.log('\n[TEST 1] Logging in with admin credentials...');
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    console.log(`Login Status: ${loginRes.status}`);
    const loginData = await loginRes.json();
    
    if (loginRes.status === 200 && loginData.token && loginData.user.role === 'admin') {
      console.log('PASS - JWT returned successfully.');
      console.log('User Role is admin:', loginData.user.role === 'admin' ? 'YES' : 'NO');
    } else {
      console.log('FAIL:', loginData);
      return;
    }

    // 2. Fetch profile request
    console.log('\n[TEST 2] Fetching profile via GET /api/auth/me with admin token...');
    const meRes = await fetch(meUrl, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    console.log(`Profile Status: ${meRes.status}`);
    const meData = await meRes.json();

    if (meRes.status === 200 && meData.role === 'admin') {
      console.log('PASS - /api/auth/me verification complete.');
      console.log('User details returned:', { id: meData._id, name: meData.name, email: meData.email, role: meData.role });
    } else {
      console.log('FAIL:', meData);
    }

  } catch (err) {
    console.error('Test error:', err.message);
  }

  console.log('\n--- SANITY CHECK COMPLETE ---');
};

testAdminAuth();
