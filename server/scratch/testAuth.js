const testAuth = async () => {
    const baseUrl = 'http://localhost:5000/api/auth';
    const email = `test_${Date.now()}@valora.com`;
    const password = 'securepassword123';
    let token = '';

    console.log('--- STARTING AUTH ENDPOINT VERIFICATION ---');

    // 1. Test registration validation
    console.log('\n[TEST 1] Register user without name (should fail)...');
    try {
        const res = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}, Message:`, data.message);
        if (res.status === 400) console.log('PASS');
        else console.log('FAIL');
    } catch (err) {
        console.error('FAIL:', err);
    }

    // 2. Test valid registration
    console.log('\n[TEST 2] Registering valid user...');
    try {
        const res = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email, password })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 201 && data.token && data.user.email === email) {
            console.log('PASS - Registered successfully.');
            console.log('User Role:', data.user.role);
        } else {
            console.log('FAIL:', data);
        }
    } catch (err) {
        console.error('FAIL:', err);
    }

    // 3. Test registering duplicate user
    console.log('\n[TEST 3] Registering duplicate user (should fail)...');
    try {
        const res = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email, password })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}, Message:`, data.message);
        if (res.status === 400) console.log('PASS');
        else console.log('FAIL');
    } catch (err) {
        console.error('FAIL:', err);
    }

    // 4. Test login with wrong credentials
    console.log('\n[TEST 4] Logging in with wrong password (should fail)...');
    try {
        const res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'wrongpassword' })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}, Message:`, data.message);
        if (res.status === 401) console.log('PASS');
        else console.log('FAIL');
    } catch (err) {
        console.error('FAIL:', err);
    }

    // 5. Test valid login
    console.log('\n[TEST 5] Logging in with valid credentials...');
    try {
        const res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 200 && data.token) {
            console.log('PASS - Logged in successfully.');
            token = data.token;
        } else {
            console.log('FAIL:', data);
        }
    } catch (err) {
        console.error('FAIL:', err);
    }

    // 6. Test GET /me without token
    console.log('\n[TEST 6] Fetching profile without JWT (should fail)...');
    try {
        const res = await fetch(`${baseUrl}/me`);
        const data = await res.json();
        console.log(`Status: ${res.status}, Message:`, data.message);
        if (res.status === 401) console.log('PASS');
        else console.log('FAIL');
    } catch (err) {
        console.error('FAIL:', err);
    }

    // 7. Test GET /me with token
    console.log('\n[TEST 7] Fetching profile with valid JWT...');
    try {
        const res = await fetch(`${baseUrl}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 200 && data.email === email) {
            console.log('PASS - Profile details retrieved successfully.');
            console.log('Profile Data:', { id: data._id, name: data.name, email: data.email, role: data.role });
        } else {
            console.log('FAIL:', data);
        }
    } catch (err) {
        console.error('FAIL:', err);
    }

    // 8. Register user with role 'admin'
    console.log('\n[TEST 8] Registering user with explicit admin role...');
    try {
        const adminEmail = `admin_${Date.now()}@valora.com`;
        const res = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Admin User', email: adminEmail, password, role: 'admin' })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 201 && data.user.role === 'buyer') {
            console.log(`RESULT: Successfully registered. Privilege escalation blocked, role set to '${data.user.role}'`);
            console.log('PASS');
        } else if (res.status === 201 && data.user.role === 'admin') {
            console.log('RESULT: Registered with role admin (Security Leak!)');
            console.log('FAIL');
        } else {
            console.log(`RESULT: Rejected with status ${res.status}`, data);
            console.log('FAIL');
        }

    } catch (err) {
        console.error('FAIL:', err);
    }

    // 9. Login with unregistered email
    console.log('\n[TEST 9] Logging in with unregistered email...');
    try {
        const res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `unregistered_${Date.now()}@valora.com`, password })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}, Message:`, data.message);
        if (res.status === 401) {
            console.log('PASS - Generic invalid credentials message returned.');
        } else {
            console.log('FAIL - Incorrect status code or message shape.');
        }
    } catch (err) {
        console.error('FAIL:', err);
    }

    // 10. GET /me with garbage token
    console.log('\n[TEST 10] Fetching profile with garbage JWT...');
    try {
        const res = await fetch(`${baseUrl}/me`, {
            headers: { 'Authorization': 'Bearer garbageTokenabc123' }
        });
        const data = await res.json();
        console.log(`Status: ${res.status}, Message:`, data.message);
        if (res.status === 401) {
            console.log('PASS - Cleanly returned 401 Unauthorized.');
        } else {
            console.log('FAIL - Expected 401.');
        }
    } catch (err) {
        console.error('FAIL:', err);
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
};

testAuth();

