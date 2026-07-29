import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import Badge from '../components/Badge';
import CarCard from '../components/CarCard';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States initialized from URL Search Params
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get('brand') ? searchParams.get('brand').split(',') : []
  );
  const [customBrandText, setCustomBrandText] = useState(searchParams.get('customBrand') || '');

  const [selectedModels, setSelectedModels] = useState(
    searchParams.get('model') ? searchParams.get('model').split(',') : []
  );
  const [customModelText, setCustomModelText] = useState(searchParams.get('customModel') || '');

  const [selectedFuels, setSelectedFuels] = useState(
    searchParams.get('fuelType') ? searchParams.get('fuelType').split(',') : []
  );

  const [selectedTransmissions, setSelectedTransmissions] = useState(
    searchParams.get('transmission') ? searchParams.get('transmission').split(',') : []
  );

  const [selectedLocations, setSelectedLocations] = useState(
    searchParams.get('location') ? searchParams.get('location').split(',') : []
  );
  const [customCityText, setCustomCityText] = useState(searchParams.get('customCity') || '');

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minYear, setMinYear] = useState(searchParams.get('minYear') || '');
  const [maxYear, setMaxYear] = useState(searchParams.get('maxYear') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 6;

  // Years options list (2015 to 2026)
  const yearsList = [];
  for (let y = 2015; y <= 2026; y++) {
    yearsList.push(y);
  }

  // Sync URL search parameters on filter changes
  useEffect(() => {
    const params = {};
    if (selectedBrands.length > 0) params.brand = selectedBrands.join(',');
    if (customBrandText) params.customBrand = customBrandText;
    
    if (selectedModels.length > 0) params.model = selectedModels.join(',');
    if (customModelText) params.customModel = customModelText;
    
    if (selectedFuels.length > 0) params.fuelType = selectedFuels.join(',');
    if (selectedTransmissions.length > 0) params.transmission = selectedTransmissions.join(',');
    
    if (selectedLocations.length > 0) params.location = selectedLocations.join(',');
    if (customCityText) params.customCity = customCityText;

    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minYear) params.minYear = minYear;
    if (maxYear) params.maxYear = maxYear;
    if (sortBy) params.sort = sortBy;
    
    setSearchParams(params, { replace: true });
  }, [
    selectedBrands, customBrandText,
    selectedModels, customModelText,
    selectedFuels,
    selectedTransmissions,
    selectedLocations, customCityText,
    minPrice, maxPrice, minYear, maxYear, sortBy
  ]);

  // Fetch unique brands on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await api.get('/listings');
        const dbBrands = [...new Set(res.data.map(item => item.brand))].filter(Boolean);
        const defaults = ['Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Toyota'];
        const brands = [...new Set([...dbBrands, ...defaults])].sort();
        setAvailableBrands(brands);
      } catch (err) {
        console.error('Error fetching initial brands:', err);
        setAvailableBrands(['Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Toyota']);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch filtered listings from API
  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      const backendFuels = selectedFuels.filter(f => f !== 'Other');
      if (backendFuels.length > 0) {
        params.fuelType = backendFuels.join(',');
      }
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minYear) params.minYear = minYear;
      if (maxYear) params.maxYear = maxYear;
      if (sortBy) params.sort = sortBy;

      const res = await api.get('/listings', { params });
      let filtered = res.data;

      // 1. Brand Filter
      if (selectedBrands.length > 0) {
        filtered = filtered.filter(item => {
          const brandMatches = selectedBrands.some(b => 
            b !== 'Other' && item.brand && item.brand.toLowerCase() === b.toLowerCase()
          );
          const customBrandMatch = selectedBrands.includes('Other') && customBrandText &&
            item.brand && item.brand.toLowerCase().includes(customBrandText.toLowerCase());
          return brandMatches || customBrandMatch;
        });
      }

      // 2. Body Type (Model) Filter
      if (selectedModels.length > 0) {
        filtered = filtered.filter(item => {
          const modelMatches = selectedModels.some(m => 
            m !== 'Other' && item.model && item.model.toLowerCase() === m.toLowerCase()
          );
          const customModelMatch = selectedModels.includes('Other') && customModelText &&
            ((item.model && item.model.toLowerCase().includes(customModelText.toLowerCase())) ||
             (item.description && item.description.toLowerCase().includes(customModelText.toLowerCase())));
          return modelMatches || customModelMatch;
        });
      }

      // 3. Fuel Filter
      if (selectedFuels.length > 0) {
        filtered = filtered.filter(item => {
          return selectedFuels.some(f => 
            item.fuelType && item.fuelType.toLowerCase() === f.toLowerCase()
          );
        });
      }

      // 4. Transmission Filter
      if (selectedTransmissions.length > 0) {
        filtered = filtered.filter(item => {
          return selectedTransmissions.some(t => 
            item.transmission && item.transmission.toLowerCase() === t.toLowerCase()
          );
        });
      }

      // 5. City Filter
      if (selectedLocations.length > 0) {
        filtered = filtered.filter(item => {
          const locMatches = selectedLocations.some(l => 
            l !== 'Other' && item.description && item.description.toLowerCase().includes(l.toLowerCase())
          );
          const customLocMatch = selectedLocations.includes('Other') && customCityText &&
            item.description && item.description.toLowerCase().includes(customCityText.toLowerCase());
          return locMatches || customLocMatch;
        });
      }

      setListings(filtered);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced API fetch on filter update
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 200);

    return () => clearTimeout(timer);
  }, [
    selectedBrands, customBrandText,
    selectedModels, customModelText,
    selectedFuels,
    selectedTransmissions,
    selectedLocations, customCityText,
    minPrice, maxPrice, minYear, maxYear, sortBy
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedBrands([]);
    setCustomBrandText('');
    setSelectedModels([]);
    setCustomModelText('');
    setSelectedFuels([]);
    setSelectedTransmissions([]);
    setSelectedLocations([]);
    setCustomCityText('');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
    setSortBy('-createdAt');
  };

  const handlePillClick = (item, selectedList, setSelectedList) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter(x => x !== item));
    } else {
      setSelectedList([...selectedList, item]);
    }
  };

  // Pagination Math
  const totalPages = Math.ceil(listings.length / listingsPerPage);
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = listings.slice(indexOfFirstListing, indexOfLastListing);

  const displayTotalPages = Math.max(totalPages, 1);

  const getPageNumbers = () => {
    const limit = displayTotalPages;
    if (limit <= 5) {
      return Array.from({ length: limit }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, '...', limit];
    }
    if (currentPage >= limit - 2) {
      return [1, '...', limit - 2, limit - 1, limit];
    }
    return [1, '...', currentPage, '...', limit];
  };

  return (
    <div className="w-full bg-background min-h-screen py-12 flex flex-col font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Filters Column (3 cols) */}
          <div className="lg:col-span-3 bg-surface border border-border rounded-card-lg p-6 shadow-sm lg:sticky lg:top-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-textPrimary m-0">
                Filters
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-primary hover:text-primaryHover bg-transparent border-none cursor-pointer hover:underline transition-colors"
              >
                Reset All
              </button>
            </div>
            <p className="text-xs text-textSecondary m-0 mb-6 leading-none">
              Narrow your search
            </p>

            <div className="space-y-5">
              {/* 1. Trust Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-semibold tracking-wider text-textSecondary uppercase">
                    Trust Score
                  </label>
                  <span className="text-[10px] font-semibold text-textSecondary bg-background px-2 py-0.5 rounded-full select-none">
                    N/A
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled
                  className="w-full accent-gray-300 cursor-not-allowed opacity-60"
                />
                <span className="text-[9px] text-textSecondary italic mt-1 block select-none">
                  Trust score filtering currently N/A (requires ML verification model)
                </span>
              </div>

              <div className="h-[1px] bg-border/60 w-full" />

              {/* 2. Price Range */}
              <div>
                <label className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-2 uppercase select-none">
                  Price Range
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-textSecondary text-xs font-medium select-none">to</span>
                  <Input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="h-[1px] bg-border/60 w-full" />

              {/* 3. Year Selector */}
              <div>
                <label className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-2 uppercase select-none">
                  Year
                </label>
                <div className="flex items-center gap-3">
                  <Select
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value)}
                    placeholder="Min"
                    options={yearsList.map((y) => ({ value: y.toString(), label: y.toString() }))}
                  />
                  <span className="text-textSecondary text-xs font-medium select-none">to</span>
                  <Select
                    value={maxYear}
                    onChange={(e) => setMaxYear(e.target.value)}
                    placeholder="Max"
                    options={yearsList.map((y) => ({ value: y.toString(), label: y.toString() }))}
                  />
                </div>
              </div>

              <div className="h-[1px] bg-border/60 w-full" />

              {/* 4. Brand */}
              <div>
                <label className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-3 uppercase select-none">
                  Brand
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[...availableBrands, 'Other'].map((brand) => {
                    const isSelected = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => handlePillClick(brand, selectedBrands, setSelectedBrands)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm'
                            : 'bg-transparent border-border text-textSecondary hover:border-textSecondary/50'
                        }`}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>
                {selectedBrands.includes('Other') && (
                  <Input
                    placeholder="Enter custom brand"
                    value={customBrandText}
                    onChange={(e) => setCustomBrandText(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="h-[1px] bg-border/60 w-full" />

              {/* 5. Body Type */}
              <div>
                <label className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-3 uppercase select-none">
                  Body Type
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['SUV', 'Sedan', 'Hatchback', 'Coupe', 'MUV', 'Convertible', 'Other'].map((body) => {
                    const isSelected = selectedModels.includes(body);
                    return (
                      <button
                        key={body}
                        type="button"
                        onClick={() => handlePillClick(body, selectedModels, setSelectedModels)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm'
                            : 'bg-transparent border-border text-textSecondary hover:border-textSecondary/50'
                        }`}
                      >
                        {body}
                      </button>
                    );
                  })}
                </div>
                {selectedModels.includes('Other') && (
                  <Input
                    placeholder="Enter custom body type"
                    value={customModelText}
                    onChange={(e) => setCustomModelText(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="h-[1px] bg-border/60 w-full" />

              {/* 6. Fuel */}
              <div>
                <label className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-3 uppercase select-none">
                  Fuel
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'].map((fuel) => {
                    const isSelected = selectedFuels.includes(fuel);
                    return (
                      <button
                        key={fuel}
                        type="button"
                        onClick={() => handlePillClick(fuel, selectedFuels, setSelectedFuels)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm'
                            : 'bg-transparent border-border text-textSecondary hover:border-textSecondary/50'
                        }`}
                      >
                        {fuel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-[1px] bg-border/60 w-full" />

              {/* 7. Transmission */}
              <div>
                <label className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-3 uppercase select-none">
                  Transmission
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Manual', 'Automatic'].map((trans) => {
                    const isSelected = selectedTransmissions.includes(trans);
                    return (
                      <button
                        key={trans}
                        type="button"
                        onClick={() => handlePillClick(trans, selectedTransmissions, setSelectedTransmissions)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm'
                            : 'bg-transparent border-border text-textSecondary hover:border-textSecondary/50'
                        }`}
                      >
                        {trans}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-[1px] bg-border/60 w-full" />

              {/* 8. City */}
              <div>
                <label className="block text-[10px] font-semibold tracking-wider text-textSecondary mb-3 uppercase select-none">
                  City
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Other'].map((city) => {
                    const isSelected = selectedLocations.includes(city);
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handlePillClick(city, selectedLocations, setSelectedLocations)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm'
                            : 'bg-transparent border-border text-textSecondary hover:border-textSecondary/50'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
                {selectedLocations.includes('Other') && (
                  <Input
                    placeholder="Enter custom city"
                    value={customCityText}
                    onChange={(e) => setCustomCityText(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

            </div>

            {/* Reset Action Block */}
            <Button
              onClick={handleResetFilters}
              variant="flat"
              size="sm"
              fullWidth
              className="mt-6 font-semibold"
            >
              Clear Filters
            </Button>
          </div>

          {/* Right Side: Search Results & Grid (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Results Header Control Bar in a Box */}
            <div className="bg-surface border border-border rounded-card-lg p-4 flex flex-row items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <h2 className="text-card-title m-0">
                  Search Results
                </h2>
                <Badge variant="primary" className="py-1">
                  {listings.length} Matches
                </Badge>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-textSecondary mr-1 select-none">
                  Sort by:
                </span>
                <div className="relative flex items-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-surface border border-border rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/45 cursor-pointer shadow-sm appearance-none hover:border-muted-foreground/30 transition-all"
                  >
                    <option value="-createdAt">Newest</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                  </select>
                  <div className="absolute right-2.5 pointer-events-none text-textSecondary flex items-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Custom Filters */}
            {(selectedBrands.length > 0 || selectedModels.length > 0 || selectedFuels.length > 0 || selectedTransmissions.length > 0 || selectedLocations.length > 0) && (
              <div className="bg-surface border border-border rounded-card-lg p-4 flex flex-col gap-3 shadow-sm text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider text-textSecondary uppercase select-none">
                    Active Filters
                  </span>
                  <button
                    onClick={handleResetFilters}
                    className="text-[10px] font-bold text-danger hover:underline bg-transparent border-none cursor-pointer focus:outline-none"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedBrands.map(b => (
                    <Badge key={`b-${b}`} variant="primary" className="items-center gap-1.5 py-1 select-none">
                      Brand: {b === 'Other' && customBrandText ? `Brand (${customBrandText})` : b}
                      <button 
                        onClick={() => setSelectedBrands(selectedBrands.filter(x => x !== b))}
                        type="button" 
                        className="hover:text-danger font-normal text-[10px] cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                  {selectedModels.map(m => (
                    <Badge key={`m-${m}`} variant="primary" className="items-center gap-1.5 py-1 select-none">
                      Body: {m === 'Other' && customModelText ? `Body (${customModelText})` : m}
                      <button 
                        onClick={() => setSelectedModels(selectedModels.filter(x => x !== m))}
                        type="button" 
                        className="hover:text-danger font-normal text-[10px] cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                  {selectedFuels.map(f => (
                    <Badge key={`f-${f}`} variant="primary" className="items-center gap-1.5 py-1 select-none">
                      Fuel: {f}
                      <button 
                        onClick={() => setSelectedFuels(selectedFuels.filter(x => x !== f))}
                        type="button" 
                        className="hover:text-danger font-normal text-[10px] cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                  {selectedTransmissions.map(t => (
                    <Badge key={`t-${t}`} variant="primary" className="items-center gap-1.5 py-1 select-none">
                      Trans: {t}
                      <button 
                        onClick={() => setSelectedTransmissions(selectedTransmissions.filter(x => x !== t))}
                        type="button" 
                        className="hover:text-danger font-normal text-[10px] cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                  {selectedLocations.map(l => (
                    <Badge key={`l-${l}`} variant="primary" className="items-center gap-1.5 py-1 select-none">
                      City: {l === 'Other' && customCityText ? `City (${customCityText})` : l}
                      <button 
                        onClick={() => setSelectedLocations(selectedLocations.filter(x => x !== l))}
                        type="button" 
                        className="hover:text-danger font-normal text-[10px] cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Grid Content */}
            {loading ? (
              <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                <p className="text-textSecondary text-xs font-bold m-0">Loading matching vehicles...</p>
              </div>
            ) : error ? (
              <div className="w-full py-16 text-center bg-dangerLight border border-dangerBorder rounded-card-lg p-6">
                <p className="text-danger text-sm font-bold m-0">{error}</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="w-full py-20 text-center bg-surface border border-border rounded-card-lg p-8 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-textSecondary/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-textPrimary mb-1 m-0">No matches found</h3>
                <p className="text-textSecondary text-xs leading-relaxed max-w-[280px] mx-auto m-0 mb-4">
                  Try widening your price range, checking other brands, or clearing some filters.
                </p>
                <Button onClick={handleResetFilters} variant="primary" className="py-2 px-5 text-xs font-bold bg-primary">
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Car Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentListings.map((listing) => (
                    <CarCard key={listing._id} car={listing} />
                  ))}
                </div>

                {/* Pagination Controls (Always show below cards when results exist) */}
                {listings.length > 0 && (
                  <div className="border-t border-border pt-8 mt-10 flex items-center justify-between">
                    <span className="text-xs font-bold text-textSecondary">
                      Showing {indexOfFirstListing + 1}–{Math.min(indexOfLastListing, listings.length)} of {listings.length} listings
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 rounded-xl border border-border text-textSecondary hover:bg-background hover:text-textPrimary flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-surface focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Page Numbers */}
                      {getPageNumbers().map((pageNum, idx) => {
                        if (pageNum === '...') {
                          return (
                            <span key={`dots-${idx}`} className="w-9 h-9 text-textSecondary flex items-center justify-center font-semibold text-sm select-none">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-9 h-9 rounded-xl text-sm font-semibold flex items-center justify-center cursor-pointer transition-colors border-none focus:outline-none ${
                              currentPage === pageNum
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-transparent text-textSecondary hover:text-primary'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, displayTotalPages))}
                        disabled={currentPage === displayTotalPages}
                        className="w-9 h-9 rounded-xl border border-border text-textSecondary hover:bg-background hover:text-textPrimary flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-surface focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Browse;
