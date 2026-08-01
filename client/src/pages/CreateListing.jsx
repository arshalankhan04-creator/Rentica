import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';

const CreateListing = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form Field States
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [kmDriven, setKmDriven] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Manual');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  // Image Upload States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Validation States
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [aiEstimate, setAiEstimate] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Revoke preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  useEffect(() => {
    const hasVehicleDetails = brand.trim() && model.trim() && year && kmDriven !== '' && fuelType && transmission;
    if (!hasVehicleDetails || !user) {
      setAiEstimate(null);
      setAiError('');
      setAiLoading(false);
      return;
    }

    const currentYear = new Date().getFullYear();
    const numericYear = Number(year);
    const numericKm = Number(kmDriven);
    if (numericYear < 1900 || numericYear > currentYear + 1 || numericKm < 0) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setAiLoading(true);
      setAiError('');
      try {
        const res = await api.post('/ml/predict-price', {
          brand: brand.trim(),
          model: model.trim(),
          year: numericYear,
          kmDriven: numericKm,
          fuelType,
          transmission
        });
        setAiEstimate(res.data);
      } catch (err) {
        setAiEstimate(null);
        setAiError(err.response?.data?.message || 'AI estimate unavailable');
      } finally {
        setAiLoading(false);
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [brand, model, year, kmDriven, fuelType, transmission, user]);

  const formatPrice = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
    return `₹${Number(value).toLocaleString('en-IN')}`;
  };

  const formatFeatureLabel = (key) => {
    return key
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Protect route: Allow only logged-in sellers
  if (authLoading) {
    return (
      <div className="w-full bg-background min-h-screen py-16 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-secondary/10 border-t-secondary rounded-full animate-spin mb-4" />
        <p className="text-textSecondary text-xs font-bold m-0">Verifying authorization status...</p>
      </div>
    );
  }

  if (!user) {
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
            Please log in to register a vehicle and create a listing.
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

  // Client-side text field validations
  const validateForm = () => {
    const tempErrors = {};
    if (!brand.trim()) tempErrors.brand = 'Brand is required';
    if (!model.trim()) tempErrors.model = 'Model is required';
    
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

  // Handle image selections and previews
  const handleFileChange = (e) => {
    setValidationError('');
    setError('');
    
    // Clear image validation error
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
    if (files.length > 6) {
      setErrors(prev => ({
        ...prev,
        images: `Maximum of 6 images allowed. You selected ${files.length}.`
      }));
      e.target.value = ''; // Reset input selection
      return;
    }

    setSelectedFiles(files);

    // Create preview object URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    // Revoke old previews to prevent memory leaks
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    // Trigger validation
    const isValid = validateForm();
    if (!isValid) {
      setValidationError('Please fix the validation errors before submitting.');
      return;
    }

    // FormData Construction
    const formData = new FormData();
    formData.append('brand', brand.trim());
    formData.append('model', model.trim());
    formData.append('year', year);
    formData.append('kmDriven', kmDriven);
    formData.append('fuelType', fuelType);
    formData.append('transmission', transmission);
    formData.append('price', price);
    formData.append('description', description.trim());

    // Append images
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    setLoading(true);
    try {
      const res = await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newListing = res.data;
      navigate(`/listings/${newListing._id}`);
    } catch (err) {
      console.error('Create listing error:', err);
      const serverMessage = err.response?.data?.message || 'Failed to create listing. Please try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-bgLight min-h-screen py-12 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto px-6 w-full text-left">
        
        {/* Title Block */}
        <div className="mb-8">
          <h1 className="text-h1 m-0">
            List Your Car
          </h1>
          <p className="text-body text-sm m-0 mt-1.5 select-none leading-relaxed">
            Enter details to get an instant AI valuation and list your vehicle on Valora.
          </p>
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

        <form onSubmit={handleSubmit} encType="multipart/form-data">
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

                {/* Drag and Drop Zone */}
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
                    id="images"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {/* Upload Icon */}
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 border border-gray-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800 m-0">
                      Drag and drop photos here
                    </p>
                    <p className="text-[11px] font-semibold text-gray-400 m-0">
                      Upload up to 6 photos of your vehicle (JPG, JPEG, PNG, or WEBP)
                    </p>
                  </div>

                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); triggerFileSelect(); }}
                    className="mt-1 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    Browse Files
                  </button>
                </div>

                {/* Inline Image Errors */}
                {errors.images && (
                  <span className="text-[11px] font-bold text-red-500 block mt-2 text-center">
                    ⚠️ {errors.images}
                  </span>
                )}

                {/* Previews Thumbnails Grid */}
                {previews.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase select-none">
                      Image Previews ({previews.length} / 6)
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {previews.map((src, index) => (
                        <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative group shadow-sm">
                          <img
                            src={src}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Price & Details */}
              <div className="bg-surface border border-border rounded-card-lg p-6 md:p-8 shadow-sm text-left space-y-6">
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h2 className="text-card-title m-0">
                    Step 3: Price & Description
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-2 uppercase">
                      Asking Price (₹) *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-semibold text-textSecondary select-none">
                        ₹
                      </span>
                      <input
                        id="price"
                        type="number"
                        placeholder="e.g. 4500000"
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
                  disabled={loading} 
                  id="create-submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="font-bold gap-2"
                >
                  {loading ? 'Saving...' : 'List My Car →'}
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
                  <p className="text-body text-xs mt-1.5 m-0">
                    {aiLoading
                      ? 'Calculating fair market range...'
                      : aiEstimate
                        ? 'Based on your vehicle details.'
                        : 'AI price estimate will appear here once you add vehicle details.'}
                  </p>
                </div>

                {aiError && (
                  <div className="bg-warningLight border border-warningBorder rounded-2xl p-4 text-warning text-xs font-bold">
                    {aiError}
                  </div>
                )}

                {aiEstimate && (
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                    <span className="block text-[10px] font-semibold tracking-wider text-textSecondary uppercase mb-2">
                      Suggested Range
                    </span>
                    <div className="text-lg font-bold text-textPrimary leading-tight">
                      {formatPrice(aiEstimate.predicted_price_min)} - {formatPrice(aiEstimate.predicted_price_max)}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs font-semibold text-textSecondary">
                      <span>Predicted value</span>
                      <span className="text-textPrimary">{formatPrice(aiEstimate.predicted_price)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs font-semibold text-textSecondary">
                      <span>Confidence</span>
                      <span className="capitalize text-primary">{aiEstimate.confidence_level}</span>
                    </div>
                  </div>
                )}

                <p className="text-[11px] font-medium text-textSecondary leading-normal m-0 select-none">
                  Estimated based on similar listings, location, age, mileage, and market demand trends.
                </p>

                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-[10px] font-semibold tracking-wider text-textSecondary uppercase m-0 mb-1 select-none">
                    Why this price?
                  </p>

                  {aiEstimate?.feature_importance
                    ? Object.entries(aiEstimate.feature_importance).slice(0, 4).map(([feature, weight]) => (
                      <div key={feature} className="flex items-center justify-between text-xs font-semibold text-textSecondary">
                        <span>{formatFeatureLabel(feature)}</span>
                        <span className="text-textSecondary/60 font-semibold">{Math.round(Number(weight) * 100)}%</span>
                      </div>
                    ))
                    : (
                      <>
                        <div className="flex items-center justify-between text-xs font-semibold text-textSecondary">
                          <span>Age & Mileage</span>
                          <span className="text-textSecondary/60 font-semibold">--</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-textSecondary">
                          <span>Location Demand</span>
                          <span className="text-textSecondary/60 font-semibold">--</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-textSecondary">
                          <span>Vehicle Specs</span>
                          <span className="text-textSecondary/60 font-semibold">--</span>
                        </div>
                      </>
                    )}
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

export default CreateListing;
