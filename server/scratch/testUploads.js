const fs = require('fs');
const path = require('path');

const testUploads = async () => {
  const authUrl = 'http://localhost:5000/api/auth';
  const listingsUrl = 'http://localhost:5000/api/listings';

  const sellerEmail = `seller_uploads_${Date.now()}@rentica.com`;
  const password = 'securepassword123';
  let sellerToken = '';
  let listingId = '';
  let uploadedFilenames = [];

  console.log('--- STARTING UPLOADS ENDPOINT VERIFICATION ---');

  // Setup: Register seller
  try {
    const res = await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Uploads Seller', email: sellerEmail, password, role: 'seller' })
    });
    const data = await res.json();
    sellerToken = data.token;
    console.log('Setup: Seller user created successfully.');
  } catch (err) {
    console.error('Setup failed:', err);
    return;
  }

  // Helper to extract filename from path (e.g., "uploads/123-abc.png" -> "123-abc.png")
  const getFilename = (filepath) => filepath.split('/').pop();

  // 1. Create listing with 2 valid image files
  console.log('\n[TEST 1] Creating listing with 2 valid images...');
  try {
    const formData = new FormData();
    formData.append('brand', 'Hyundai');
    formData.append('model', 'i20');
    formData.append('year', '2020');
    formData.append('kmDriven', '30000');
    formData.append('fuelType', 'Petrol');
    formData.append('transmission', 'Manual');
    formData.append('price', '800000');
    formData.append('description', 'Nice hatchback');

    const fileBlob1 = new Blob(['mock-image-png-content'], { type: 'image/png' });
    const fileBlob2 = new Blob(['mock-image-jpg-content'], { type: 'image/jpeg' });
    formData.append('images', fileBlob1, 'hatchback1.png');
    formData.append('images', fileBlob2, 'hatchback2.jpg');

    const res = await fetch(listingsUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sellerToken}` },
      body: formData
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);

    if (res.status === 201 && data.images && data.images.length === 2) {
      listingId = data._id;
      uploadedFilenames = data.images.map(getFilename);
      console.log('PASS - Listing created. Image paths in DB:', data.images);
      
      // Verify files physically exist on disk
      const filesExist = uploadedFilenames.every(name => {
        const fullPath = path.join(__dirname, '..', 'uploads', name);
        return fs.existsSync(fullPath);
      });
      console.log('Physical files exist on disk:', filesExist ? 'YES' : 'NO');
      if (filesExist) console.log('PASS (Physical Files)');
      else console.log('FAIL (Physical Files)');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 2. Fetch file via static serving mount /uploads
  console.log('\n[TEST 2] Fetching file via static /uploads route...');
  try {
    if (uploadedFilenames.length > 0) {
      const url = `http://localhost:5000/uploads/${uploadedFilenames[0]}`;
      const res = await fetch(url);
      const content = await res.text();
      console.log(`Status: ${res.status}, Content: "${content}"`);
      if (res.status === 200 && content === 'mock-image-png-content') {
        console.log('PASS - Successfully retrieved static asset with correct content.');
      } else {
        console.log('FAIL - Incorrect status or file content.');
      }
    } else {
      console.log('SKIP - No files uploaded.');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 3. Confirm createListing ignores images array in body
  console.log('\n[TEST 3] Creating listing with fake images array in body (should ignore)...');
  try {
    const res = await fetch(listingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        brand: 'Hyundai',
        model: 'i20',
        year: 2020,
        kmDriven: 30000,
        fuelType: 'Petrol',
        transmission: 'Manual',
        price: 800000,
        images: ['uploads/fake_hijack_image.jpg']
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Images Array Length: ${data.images ? data.images.length : 'N/A'}`);
    if (res.status === 201 && data.images && data.images.length === 0) {
      console.log('PASS - Faked images in body were successfully ignored.');
      // Clean up the created testing listing
      await fetch(`${listingsUrl}/${data._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      });
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 4. Add more images to existing listing
  console.log('\n[TEST 4] Appending 2 more images to the listing...');
  try {
    const formData = new FormData();
    const fileBlob3 = new Blob(['mock-image-3'], { type: 'image/png' });
    const fileBlob4 = new Blob(['mock-image-4'], { type: 'image/png' });
    formData.append('images', fileBlob3, 'hatchback3.png');
    formData.append('images', fileBlob4, 'hatchback4.png');

    const res = await fetch(`${listingsUrl}/${listingId}/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sellerToken}` },
      body: formData
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Total Images: ${data.images ? data.images.length : 'N/A'}`);
    if (res.status === 200 && data.images && data.images.length === 4) {
      console.log('PASS - Successfully appended 2 images.');
    } else {
      console.log('FAIL:', data);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 5. Exceed total image limit of 6 (attempting to add 3 more, making it 7)
  console.log('\n[TEST 5] Attempting to add 3 more images (making it 7 total - should fail 400)...');
  // We will track the contents of the uploads folder before the request to check for orphaned files
  const uploadDir = path.join(__dirname, '..', 'uploads');
  const filesBefore = fs.readdirSync(uploadDir);

  try {
    const formData = new FormData();
    const fileBlob5 = new Blob(['mock-image-5'], { type: 'image/png' });
    const fileBlob6 = new Blob(['mock-image-6'], { type: 'image/png' });
    const fileBlob7 = new Blob(['mock-image-7'], { type: 'image/png' });
    formData.append('images', fileBlob5, 'hatchback5.png');
    formData.append('images', fileBlob6, 'hatchback6.png');
    formData.append('images', fileBlob7, 'hatchback7.png');

    const res = await fetch(`${listingsUrl}/${listingId}/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sellerToken}` },
      body: formData
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);

    const filesAfter = fs.readdirSync(uploadDir);
    const orphanedFiles = filesAfter.filter(f => !filesBefore.includes(f));

    console.log('Orphaned files left on disk:', orphanedFiles.length);

    if (res.status === 400 && orphanedFiles.length === 0) {
      console.log('PASS - Correctly rejected limit and cleaned up temporary files.');
    } else {
      console.log('FAIL - Files were leaked or status code incorrect.', orphanedFiles);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 6. Test invalid file type (upload text file)
  console.log('\n[TEST 6] Uploading an invalid file type .txt (should fail 400)...');
  const filesBeforeTxt = fs.readdirSync(uploadDir);
  try {
    const formData = new FormData();
    const textBlob = new Blob(['malicious-script'], { type: 'text/plain' });
    formData.append('images', textBlob, 'hack.txt');

    const res = await fetch(`${listingsUrl}/${listingId}/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sellerToken}` },
      body: formData
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);

    const filesAfterTxt = fs.readdirSync(uploadDir);
    const orphanedTxtFiles = filesAfterTxt.filter(f => !filesBeforeTxt.includes(f));

    console.log('Orphaned files left on disk:', orphanedTxtFiles.length);

    if (res.status === 400 && orphanedTxtFiles.length === 0) {
      console.log('PASS - Correctly rejected invalid extension and cleaned up.');
    } else {
      console.log('FAIL - Leaked file or wrong status.', orphanedTxtFiles);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 7. Delete single image out of range
  console.log('\n[TEST 7] Deleting listing image with out-of-range index (index 5 - should fail 400)...');
  try {
    const res = await fetch(`${listingsUrl}/${listingId}/images/5`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);
    if (res.status === 400) console.log('PASS');
    else console.log('FAIL');
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 8. Delete single image valid index
  console.log('\n[TEST 8] Deleting listing image index 1 (should succeed)...');
  let imageToDelete = '';
  try {
    // Get the path of the image we want to delete
    let getRes = await fetch(`${listingsUrl}/${listingId}`);
    let getData = await getRes.json();
    imageToDelete = getFilename(getData.images[1]);

    const res = await fetch(`${listingsUrl}/${listingId}/images/1`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Remaining Images: ${data.listing ? data.listing.images.length : 'N/A'}`);
    
    // Verify physical file was deleted
    const fileExists = fs.existsSync(path.join(uploadDir, imageToDelete));
    console.log('Physical file still exists:', fileExists ? 'YES' : 'NO');

    if (res.status === 200 && data.listing.images.length === 3 && !fileExists) {
      console.log('PASS - Image index removed from DB and physical file unlinked.');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 9. Delete entire listing (should clean up all remaining physical files)
  console.log('\n[TEST 9] Deleting entire listing (should clean up all physical images)...');
  try {
    // Get remaining images
    let getRes = await fetch(`${listingsUrl}/${listingId}`);
    let getData = await getRes.json();
    const remainingFiles = getData.images.map(getFilename);
    console.log('Remaining files in DB before delete:', remainingFiles);

    const res = await fetch(`${listingsUrl}/${listingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    console.log(`Status: ${res.status}`);

    // Verify all remaining files are physically deleted
    const filesLeaked = remainingFiles.some(name => fs.existsSync(path.join(uploadDir, name)));
    console.log('Any physical files leaked on disk:', filesLeaked ? 'YES' : 'NO');

    if (res.status === 200 && !filesLeaked) {
      console.log('PASS - Listing deleted and all physical image files unlinked successfully.');
    } else {
      console.log('FAIL - Files leaked or delete failed.');
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  // 10. Test mixed valid/invalid files in multipart creation (should reject and clean up all files)
  console.log('\n[TEST 10] Creating listing with mixed valid images and 1 invalid text file (should fail 400 & cleanup)...');
  const filesBeforeMixed = fs.readdirSync(uploadDir);
  try {
    const formData = new FormData();
    formData.append('brand', 'Honda');
    formData.append('model', 'Civic');
    formData.append('year', '2019');
    formData.append('kmDriven', '50000');
    formData.append('fuelType', 'Petrol');
    formData.append('transmission', 'Manual');
    formData.append('price', '1500000');
    formData.append('description', 'Mixed test');

    const fileBlob1 = new Blob(['mock-png-mixed'], { type: 'image/png' });
    const fileBlob2 = new Blob(['mock-jpg-mixed'], { type: 'image/jpeg' });
    const invalidBlob = new Blob(['mock-txt-mixed'], { type: 'text/plain' });
    formData.append('images', fileBlob1, 'mixed1.png');
    formData.append('images', fileBlob2, 'mixed2.jpg');
    formData.append('images', invalidBlob, 'mixed3.txt');

    const res = await fetch(listingsUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sellerToken}` },
      body: formData
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Message:`, data.message);

    const filesAfterMixed = fs.readdirSync(uploadDir);
    const orphanedMixedFiles = filesAfterMixed.filter(f => !filesBeforeMixed.includes(f));

    console.log('Orphaned files left on disk:', orphanedMixedFiles.length);

    if (res.status === 400 && orphanedMixedFiles.length === 0) {
      console.log('PASS - Mixed upload correctly rejected and all partially written files cleaned up.');
    } else {
      console.log('FAIL - Files leaked or status code incorrect.', orphanedMixedFiles);
    }
  } catch (err) {
    console.error('FAIL:', err);
  }

  console.log('\n--- VERIFICATION COMPLETE ---');
};

testUploads();


