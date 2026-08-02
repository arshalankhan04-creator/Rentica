import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';
import Badge from '../components/Badge';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);

  // Listing Data States
  const [listing, setListing] = useState(null);
  const [fetching, setFetching] = useState(true);

  // Form Field States
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [kmDriven, setKmDriven] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Manual');
  const [bodyType, setBodyType] = useState('SUV');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  // New Image States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Validation States
  const [errors, setErrors] = useState({});
  const [deletingIdx, setDeletingIdx] = useState(null);

  // UI States
  const [savingText, setSavingText] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Fetch listing details on load
  const fetchListing = async () => {
    setFetching(true);
    try {
      const res = await api.get(`/listings/${id}`);
      const data = res.data;
      setListing(data);
      
      // Prefill text values
      setBrand(data.brand);
      setModel(data.model);
      setYear(data.year);
      setKmDriven(data.kmDriven);
      setFuelType(data.fuelType);
      setTransmission(data.transmission);
      setBodyType(data.bodyType || 'SUV');
      setLocation(data.location || '');
      setPrice(data.price);
      setDescription(data.description || '');
    } catch (err) {
      console.error('Fetch listing error:', err);
      setError('Listing not found');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  // Protect page: Loading check
  if (authLoading || fetching) {
    return (
      <div className="w-full bg-background min-h-screen py-16 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-secondary/10 border-t-secondary rounded-full animate-spin mb-4" />
        <p className="text-textSecondary text-xs font-bold m-0">Loading details...</p>
      </div>
    );
  }

  // Helper to extract string representation of seller ID
  const getSellerId = (seller) => {
    if (!seller) return '';
    if (typeof seller === 'object') return seller._id || '';
    return seller;
  };

  const sellerId = getSellerId(listing?.seller);
  const userId = user ? (user._id || user.id || '') : '';
  const isOwnListing = userId && sellerId && sellerId.toString() === userId.toString();

  // Access check
  if (!user || !isOwnListing) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-16 flex flex-col items-center justify-center font-sans">
        <div className="max-w-md w-full bg-surface border border-border rounded-card-lg p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-dangerLight border border-dangerBorder/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-textPrimary mb-2">Access Denied</h2>
          <p className="text-textSecondary text-sm font-medium leading-relaxed mb-6">
            You are not authorized to edit this listing.
          </p>
          <Link to="/" className="no-underline">
            <Button variant="primary" size="md" className="font-bold">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Deleting existing image
  const handleDeleteImage = async (index) => {
    if (deletingIdx !== null) return; // Prevent concurrent deletion requests
    
    setError('');
    setValidationError('');
    if (!window.confirm('Are you sure you want to remove this image?')) return;

    setDeletingIdx(index);
    try {
      const res = await api.delete(`/listings/${id}/images/${index}`);
      setListing(res.data.listing);
    } catch (err) {
      console.error('Delete image error:', err);
      const errMsg = err.response?.data?.message;
      if (errMsg === 'Invalid image index') {
        console.warn('Image index was already invalid, likely already deleted by a double click.');
        // Refresh listings state from database to ensure sync
        await fetchListing();
      } else {
        setError(errMsg || 'Failed to remove image.');
      }
    } finally {
      setDeletingIdx(null);
    }
  };

  // Client-side text field validations
  const validateForm = () => {
    const tempErrors = {};
    if (!brand.trim()) tempErrors.brand = 'Brand is required';
    if (!model.trim()) tempErrors.model = 'Model is required';
    if (!bodyType.trim()) tempErrors.bodyType = 'Body Type is required';
    if (!location.trim()) tempErrors.location = 'Location is required';
    
    if (!year) {
      tempErrors.year = 'Year is required';
    } else {
      const y = Number(year);
      const currentYear = new Date().getFullYear();
      if (y < 1900 || y > currentYear + 1) {
        tempErrors.year = `Enter a valid year (1900-${currentYear + 1})`;
      }
    }

    if (kmDriven === '') {
      tempErrors.kmDriven = 'Kilometers driven is required';
    } else if (Number(kmDriven) < 0) {
      tempErrors.kmDriven = 'Kilometers driven cannot be negative';
    }

    if (!price) {
      tempErrors.price = 'Price is required';
    } else if (Number(price) <= 0) {
      tempErrors.price = 'Price must be greater than 0';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle drag-and-drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Handle new file selections
  const handleFileChange = (e) => {
    setValidationError('');
    setError('');

    // Clear image errors
    setErrors(prev => ({ ...prev, images: '' }));

    const files = Array.from(e.target.files);

    // 1. Verify file types immediately
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validExtensions.includes(file.type));

    if (invalidFiles.length > 0) {
      const invalidNames = invalidFiles.map(f => f.name).join(', ');
      setErrors(prev => ({
        ...prev,
        images: `Invalid file type: ${invalidNames}. Only JPG, JPEG, PNG, and WEBP are allowed.`
      }));
      e.target.value = ''; // Reset input selection
      return;
    }

    // 2. Verify total image count (max 6)
    const existingCount = listing.images ? listing.images.length : 0;
    const totalCount = existingCount + files.length;
    if (totalCount > 6) {
      setErrors(prev => ({
        ...prev,
        images: `Maximum of 6 images allowed total. Current count is ${existingCount}, you selected ${files.length}.`
      }));
      e.target.value = ''; // Reset input selection
      return;
    }

    setSelectedFiles(files);

    const newUrls = files.map((file) => URL.createObjectURL(file));
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewPreviews(newUrls);
  };

  // Uploading new images
  const handleUploadImages = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setValidationError('');

    if (selectedFiles.length === 0) {
      setValidationError('Please select at least one image file to upload.');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    setUploadingImages(true);
    try {
      const res = await api.post(`/listings/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setListing(res.data);
      setSelectedFiles([]);
      setNewPreviews([]);
      alert('Images uploaded successfully.');
    } catch (err) {
      console.error('Upload images error:', err);
      setError(err.response?.data?.message || 'Failed to upload images.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Saving text fields changes
  const handleSaveText = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    // Trigger validation
    const isValid = validateForm();
    if (!isValid) {
      setValidationError('Please fix the validation errors before submitting.');
      return;
    }

    setSavingText(true);
    try {
      await api.put(`/listings/${id}`, {
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        kmDriven: Number(kmDriven),
        fuelType,
        transmission,
        bodyType: bodyType.trim(),
        location: location.trim(),
        price: Number(price),
        description: description.trim()
      });
      navigate(`/listings/${id}`);
    } catch (err) {
      console.error('Save text fields error:', err);
      const serverMessage = err.response?.data?.message || 'Failed to save edits.';
      setError(serverMessage);
    } finally {
      setSavingText(false);
    }
  };

  const imageCount = listing.images ? listing.images.length : 0;

  return (
    <div className="w-full bg-bgLight min-h-screen py-12 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto px-6 w-full text-left">
        
        {/* Title Block */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h1 m-0">
              Edit Your Listing
            </h1>
            <p className="text-body text-sm m-0 mt-1.5 select-none leading-relaxed">
              Modify the details and images for your listed vehicle.
            </p>
          </div>
          <Link to={`/listings/${id}`} className="no-underline">
            <Button variant="ghost" size="sm" className="font-bold text-textSecondary hover:text-textPrimary flex items-center gap-1">
              &larr; Cancel and Go Back
            </Button>
          </Link>
        </div>

        {/* Global Errors */}
        {validationError && (
          <div className="w-full py-4 px-6 bg-dangerLight border border-dangerBorder rounded-2xl p-6 mb-6 text-danger text-xs font-bold" id="validation-error">
            {validationError}
          </div>
        )}
        {error && (
          <div className="w-full py-4 px-6 bg-dangerLight border border-dangerBorder rounded-2xl p-6 mb-6 text-danger text-xs font-bold" id="server-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveText}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: Step Cards (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Step 1: Vehicle Details */}
              <div className="bg-surface border border-border rounded-card-lg p-6 md:p-8 shadow-sm text-left space-y-6">
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-card-title m-0">
                    Step 1: Vehicle Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand */}
                  <div>
                    <label htmlFor="brand" className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-2 uppercase">
                      Brand *
                    </label>
                    <input
                      id="brand"
                      type="text"
                      placeholder="e.g. Audi"
                      value={brand}
                      onChange={(e) => {
                        setBrand(e.target.value);
                        if (errors.brand) setErrors(prev => ({ ...prev, brand: '' }));
                      }}
                      onBlur={() => {
                        if (!brand.trim()) setErrors(prev => ({ ...prev, brand: 'Brand is required' }));
                      }}
                      className={`w-full bg-surface border rounded-xl px-4 py-3 text-xs font-medium text-textPrimary placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary hover:border-muted-foreground/35 transition-all ${
                        errors.brand ? 'border-danger focus:ring-danger/30' : 'border-border'
                      }`}
                      required
                    />
                    {errors.brand && (
                      <span className="text-[10px] font-bold text-danger mt-1.5 block">
                        {errors.brand}
                      </span>
                    )}
                  </div>

                  {/* Model */}
                  <div>
                    <label htmlFor="model" className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-2 uppercase">
                      Model *
                    </label>
                    <input
                      id="model"
                      type="text"
                      placeholder="e.g. A6"
                      value={model}
                      onChange={(e) => {
                        setModel(e.target.value);
                        if (errors.model) setErrors(prev => ({ ...prev, model: '' }));
                      }}
                      onBlur={() => {
                        if (!model.trim()) setErrors(prev => ({ ...prev, model: 'Model is required' }));
                      }}
                      className={`w-full bg-surface border rounded-xl px-4 py-3 text-xs font-medium text-textPrimary placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary hover:border-muted-foreground/35 transition-all ${
                        errors.model ? 'border-danger focus:ring-danger/30' : 'border-border'
                      }`}
                      required
                    />
                    {errors.model && (
                      <span className="text-[10px] font-bold text-danger mt-1.5 block">
                        {errors.model}
                      </span>
                    )}
                  </div>

                  {/* Body Type */}
                  <div className="flex flex-col gap-1.5 w-full text-left">
                    <label htmlFor="bodyType" className="text-xs font-semibold text-textPrimary uppercase tracking-wider">
                      Body Type *
                    </label>
                    <div className="relative w-full flex items-center">
                      <select
                        id="bodyType"
                        value={bodyType}
                        onChange={(e) => setBodyType(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 rounded-xl border border-border bg-surface text-xs font-semibold text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary appearance-none cursor-pointer hover:border-muted-foreground/30 transition-all shadow-sm"
                        required
                      >
                        <option value="SUV">SUV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Convertible">Convertible</option>
                        <option value="Wagon">Wagon</option>
                      </select>
                      <div className="absolute right-3.5 pointer-events-none text-muted-foreground flex items-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-2 uppercase">
                      Location (City, State) *
                    </label>
                    <input
                      id="location"
                      type="text"
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
                      }}
                      onBlur={() => {
                        if (!location.trim()) setErrors(prev => ({ ...prev, location: 'Location is required' }));
                      }}
                      className={`w-full bg-surface border rounded-xl px-4 py-3 text-xs font-medium text-textPrimary placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary hover:border-muted-foreground/35 transition-all ${
                        errors.location ? 'border-danger focus:ring-danger/30' : 'border-border'
                      }`}
                      required
                    />
                    {errors.location && (
                      <span className="text-[10px] font-bold text-danger mt-1.5 block">
                        {errors.location}
                      </span>
                    )}
                  </div>

                  {/* Year */}
                  <div>
                    <label htmlFor="year" className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-2 uppercase">
                      Year *
                    </label>
                    <input
                      id="year"
                      type="number"
                      placeholder="e.g. 2020"
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value);
                        if (errors.year) setErrors(prev => ({ ...prev, year: '' }));
                      }}
                      onBlur={() => {
                        if (!year) {
                          setErrors(prev => ({ ...prev, year: 'Year is required' }));
                        } else {
                          const y = Number(year);
                          const currentYear = new Date().getFullYear();
                          if (y < 1900 || y > currentYear + 1) {
                            setErrors(prev => ({ ...prev, year: `Enter a valid year (1900-${currentYear + 1})` }));
                          }
                        }
                      }}
                      className={`w-full bg-surface border rounded-xl px-4 py-3 text-xs font-medium text-textPrimary placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary hover:border-muted-foreground/35 transition-all ${
                        errors.year ? 'border-danger focus:ring-danger/30' : 'border-border'
                      }`}
                      required
                    />
                    {errors.year && (
                      <span className="text-[10px] font-bold text-danger mt-1.5 block">
                        {errors.year}
                      </span>
                    )}
                  </div>

                  {/* Kilometers Driven */}
                  <div>
                    <label htmlFor="kmDriven" className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-2 uppercase">
                      Kilometers Driven *
                    </label>
                    <input
                      id="kmDriven"
                      type="number"
                      placeholder="e.g. 25000"
                      value={kmDriven}
                      onChange={(e) => {
                        setKmDriven(e.target.value);
                        if (errors.kmDriven) setErrors(prev => ({ ...prev, kmDriven: '' }));
                      }}
                      onBlur={() => {
                        if (kmDriven === '') {
                          setErrors(prev => ({ ...prev, kmDriven: 'Kilometers driven is required' }));
                        } else if (Number(kmDriven) < 0) {
                          setErrors(prev => ({ ...prev, kmDriven: 'Kilometers driven cannot be negative' }));
                        }
                      }}
                      className={`w-full bg-surface border rounded-xl px-4 py-3 text-xs font-medium text-textPrimary placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary hover:border-muted-foreground/35 transition-all ${
                        errors.kmDriven ? 'border-danger focus:ring-danger/30' : 'border-border'
                      }`}
                      required
                    />
                    {errors.kmDriven && (
                      <span className="text-[10px] font-bold text-danger mt-1.5 block">
                        {errors.kmDriven}
                      </span>
                    )}
                  </div>

                  {/* Fuel Type */}
                  <div className="flex flex-col gap-1.5 w-full text-left">
                    <label htmlFor="fuelType" className="text-xs font-semibold text-textPrimary uppercase tracking-wider">
                      Fuel Type *
                    </label>
                    <div className="relative w-full flex items-center">
                      <select
                        id="fuelType"
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 rounded-xl border border-border bg-surface text-xs font-semibold text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary appearance-none cursor-pointer hover:border-muted-foreground/30 transition-all shadow-sm"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="CNG">CNG</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                      <div className="absolute right-3.5 pointer-events-none text-muted-foreground flex items-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Transmission */}
                  <div className="flex flex-col gap-1.5 w-full text-left">
                    <label htmlFor="transmission" className="text-xs font-semibold text-textPrimary uppercase tracking-wider">
                      Transmission *
                    </label>
                    <div className="relative w-full flex items-center">
                      <select
                        id="transmission"
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 rounded-xl border border-border bg-surface text-xs font-semibold text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary appearance-none cursor-pointer hover:border-muted-foreground/30 transition-all shadow-sm"
                      >
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                      </select>
                      <div className="absolute right-3.5 pointer-events-none text-muted-foreground flex items-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Photos */}
              <div className="bg-surface border border-border rounded-card-lg p-6 md:p-8 shadow-sm text-left space-y-6">
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h2 className="text-card-title m-0">
                    Step 2: Photos
                  </h2>
                </div>

                {/* Existing Images Grid */}
                {listing.images && listing.images.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold tracking-wider text-textSecondary uppercase select-none">
                      Uploaded Images ({listing.images.length} / 6)
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {listing.images.map((img, index) => (
                        <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative group shadow-sm">
                          <img
                            src={`http://localhost:5000/${img}`}
                            alt={`Listing image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Hover delete button overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(index)}
                              disabled={deletingIdx !== null}
                              className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-red-500 flex items-center justify-center shadow-md cursor-pointer transition-colors border-none disabled:opacity-50"
                              title="Delete Image"
                            >
                              {deletingIdx === index ? (
                                <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Images Zone (only if total count is under 6) */}
                {imageCount < 6 ? (
                  <div className="space-y-4">
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={triggerFileSelect}
                      className={`w-full border-2 border-dashed rounded-2xl p-8 text-center bg-muted/30 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 select-none ${
                        dragActive ? 'border-secondary bg-secondary/5' : 'border-border hover:border-primary'
                      } ${errors.images ? 'border-danger bg-dangerLight/10' : ''}`}
                    >
                      <input
                        ref={fileInputRef}
                        id="new-images"
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shadow-sm text-textSecondary border border-border">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-textPrimary m-0">
                          Drag and drop new photos here
                        </p>
                        <p className="text-[11px] font-semibold text-textSecondary m-0">
                          Add more photos (up to {6 - imageCount} allowed total)
                        </p>
                      </div>

                      <Button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); triggerFileSelect(); }}
                        variant="outline"
                        size="sm"
                        className="mt-1 font-bold shadow-sm"
                      >
                        Browse Files
                      </Button>
                    </div>

                    {/* Inline Image Errors */}
                    {errors.images && (
                      <span className="text-[11px] font-bold text-red-500 block mt-2 text-center">
                        ⚠️ {errors.images}
                      </span>
                    )}

                    {/* Previews Thumbnails Grid for newly selected files */}
                    {newPreviews.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-semibold tracking-wider text-textSecondary uppercase select-none">
                          Newly Selected Images ({newPreviews.length})
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 border border-border rounded-2xl p-4">
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 flex-1">
                            {newPreviews.map((src, index) => (
                              <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden border border-border bg-surface relative group shadow-sm">
                                <img
                                  src={src}
                                  alt={`New Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <Button
                            type="button"
                            onClick={handleUploadImages}
                            disabled={uploadingImages}
                            variant="primary"
                            size="sm"
                            className="font-bold border-none shadow-sm whitespace-nowrap self-end sm:self-center"
                          >
                            {uploadingImages ? 'Uploading...' : 'Upload Selected'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-warningLight border border-warningBorder rounded-2xl text-warning text-xs font-bold">
                    You have reached the maximum limit of 6 listing images. Delete existing images above if you want to upload new ones.
                  </div>
                )}
              </div>

              {/* Step 3: Pricing & Review */}
              <div className="bg-surface border border-border rounded-card-lg p-6 md:p-8 shadow-sm text-left space-y-6">
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h2 className="text-card-title m-0">
                    Step 3: Pricing & Review
                  </h2>
                </div>

                {/* Price input container in a box */}
                <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-4">
                  <div>
                    <label htmlFor="price" className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-2 uppercase">
                      Your Asking Price (₹) *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-semibold text-textSecondary select-none">
                        ₹
                      </span>
                      <input
                        id="price"
                        type="number"
                        placeholder="Enter your price"
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                        }}
                        onBlur={() => {
                          if (!price) {
                            setErrors(prev => ({ ...prev, price: 'Price is required' }));
                          } else if (Number(price) <= 0) {
                            setErrors(prev => ({ ...prev, price: 'Price must be greater than 0' }));
                          }
                        }}
                        className={`w-full bg-surface border rounded-xl pl-8 pr-4 py-3 text-xs font-semibold text-textPrimary placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary hover:border-muted-foreground/35 transition-all ${
                          errors.price ? 'border-danger focus:ring-danger/30' : 'border-border'
                        }`}
                        required
                      />
                    </div>
                    {errors.price && (
                      <span className="text-[10px] font-bold text-danger mt-1.5 block">
                        {errors.price}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-textSecondary mt-2 block select-none">
                      ℹ Based on current market data, setting a price near the AI estimate increases sale speed by 40%.
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-2 uppercase">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows="5"
                    placeholder="Details about vehicle condition, service history, features, and overall ownership history."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-xs font-semibold text-textSecondary placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary hover:border-muted-foreground/35 transition-all"
                  />
                </div>

                {/* Submit button */}
                <Button 
                  type="submit" 
                  disabled={savingText} 
                  id="edit-submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="font-bold gap-2"
                >
                  {savingText ? 'Saving...' : 'Save Text Details →'}
                </Button>
              </div>

            </div>

            {/* Right Side: Sticky Sidebar (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
              
              {/* AI Valuation Panel */}
              <div className="bg-surface border border-border rounded-card-lg p-6 shadow-sm text-left space-y-5">
                <div>
                  <h3 className="text-card-title m-0">
                    Live AI Price Estimate
                  </h3>
                  <span className="text-[10px] font-semibold text-textSecondary bg-muted border border-border px-2 py-0.5 rounded-md inline-block mt-1 select-none">
                    Coming Soon
                  </span>
                </div>

                <div className="bg-muted/35 border border-border rounded-2xl p-4 text-center">
                  <p className="text-textSecondary text-xs font-semibold leading-relaxed m-0">
                    AI price estimate will appear here once you add vehicle details.
                  </p>
                </div>

                <p className="text-[11px] font-medium text-textSecondary leading-normal m-0 select-none">
                  Estimated based on similar listings, location, age, mileage, and market demand trends.
                </p>

                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-[10px] font-semibold tracking-wider text-textSecondary uppercase m-0 mb-1 select-none">
                    Why this price?
                  </p>
                  
                  <div className="flex items-center justify-between text-xs font-semibold text-textSecondary">
                    <span>Age & Mileage</span>
                    <span className="text-textSecondary/60 font-semibold">--</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-semibold text-textSecondary">
                    <span>Location Demand</span>
                    <span className="text-textSecondary/60 font-semibold">--</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-textSecondary">
                    <span>Single Owner</span>
                    <span className="text-textSecondary/60 font-semibold">--</span>
                  </div>
                </div>

                {/* Trust Score circular indicator */}
                <div className="border-t border-border pt-4">
                  <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-border bg-surface flex items-center justify-center font-bold text-textSecondary select-none">
                      N/A
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-xs font-bold text-textPrimary block leading-tight">
                        Listing Trust Score
                      </span>
                      <span className="text-[10px] font-semibold text-textSecondary block mt-0.5 select-none">
                        Score: N/A • Not Rated
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Shield */}
              <div className="flex items-center justify-center gap-2 text-textSecondary text-xs font-bold select-none">
                <svg className="w-4 h-4 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure & Encrypted Data</span>
              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default EditListing;
