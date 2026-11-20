import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Select from '../components/Select';
import CarCard from '../components/CarCard';
import ClientFeedback from '../components/ui/testimonial';
import api from '../api/axios';

// Static Featured Cars Dummy Data
const FEATURED_CARS = [
  {
    id: '1',
    brand: 'Audi',
    model: 'A6 Premium Plus',
    year: 2021,
    pricePerDay: 95,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '24,500 km',
    location: 'Bangalore',
    postedDate: 'Available now',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-slate-700 to-slate-900',
  },
  {
    id: '2',
    brand: 'BMW',
    model: '5 Series 530d',
    year: 2022,
    pricePerDay: 120,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    mileage: '8,200 km',
    location: 'Mumbai',
    postedDate: 'Available now',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-blue-700 to-blue-900',
  },
  {
    id: '3',
    brand: 'Mercedes-Benz',
    model: 'C-Class C200',
    year: 2020,
    pricePerDay: 90,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '18,500 km',
    location: 'Delhi',
    postedDate: 'Available now',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-zinc-700 to-zinc-900',
  },
  {
    id: '4',
    brand: 'Porsche',
    model: 'Cayenne Coupé',
    year: 2022,
    pricePerDay: 220,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '4,100 km',
    location: 'Mumbai',
    postedDate: 'Available now',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-amber-700 to-amber-900',
  },
  {
    id: '5',
    brand: 'Audi',
    model: 'Q7 Technology',
    year: 2021,
    pricePerDay: 150,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    mileage: '12,400 km',
    location: 'Pune',
    postedDate: 'Available now',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-cyan-750 to-cyan-950',
  },
  {
    id: '6',
    brand: 'BMW',
    model: 'M4 Competition',
    year: 2022,
    pricePerDay: 200,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '3,200 km',
    location: 'Bangalore',
    postedDate: 'Available now',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    gradient: 'from-emerald-700 to-emerald-950',
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Search Filter States
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [availableBrands, setAvailableBrands] = useState([]);

  // Fetch unique brands from database for dropdown pre-population
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get('/listings');
        if (res.data && res.data.length > 0) {
          const brands = [...new Set(res.data.map(item => item.brand))].sort();
          setAvailableBrands(brands);
        }
      } catch (err) {
        console.error('Error fetching brands for homepage filters:', err);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get('/listings');
        if (res.data && res.data.length > 0) {
          setFeaturedListings(res.data.slice(0, 4));
        } else {
          setFeaturedListings(FEATURED_CARS.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching live listings, falling back to static:', err);
        setFeaturedListings(FEATURED_CARS.slice(0, 4));
      } finally {
        setLoadingListings(false);
      }
    };
    fetchListings();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedBrand) params.set('brand', selectedBrand);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedLocation) params.set('location', selectedLocation);

    if (priceRange) {
      if (priceRange === '0-20') {
        params.set('minPrice', '0');
        params.set('maxPrice', '2000000');
      } else if (priceRange === '20-50') {
        params.set('minPrice', '2000000');
        params.set('maxPrice', '5000000');
      } else if (priceRange === '50-100') {
        params.set('minPrice', '5000000');
        params.set('maxPrice', '10000000');
      } else if (priceRange === '100+') {
        params.set('minPrice', '10000000');
      }
    }

    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="w-full bg-bgLight min-h-screen flex flex-col font-sans">

      {/* Hero Section Container */}
      <div className="relative w-full min-h-[500px] bg-surface overflow-hidden flex items-center">

        {/* Diagonal Slanted Indigo Background Split (Clipped Div) */}
        <div
          className="absolute inset-y-0 right-0 w-[50%] bg-primary z-0 hidden md:block"
          style={{ clipPath: 'polygon(62% 0, 100% 0, 100% 100%, 10% 100%)' }}
        />

        {/* Content Layer */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full relative z-10 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Left Zone: Headline & Actions (On White background) */}
          <div className="flex-1 text-left space-y-8 max-w-xl">
            <div className="space-y-4">
              <h1 className="text-display uppercase m-0">
                RENT SMARTER. <br />
                <span style={{ color: 'var(--color-primary)' }}>DRIVE BETTER.</span>
              </h1>
              <p className="text-body text-lg m-0 leading-relaxed max-w-lg">
                Rentica is the premium car rental marketplace where you can discover, compare, and book vehicles from trusted owners — all in one place.
              </p>
            </div>

            <div className="flex flex-row items-center gap-4">
              <Button onClick={() => navigate('/browse')} variant="primary" pill size="lg" className="shadow-lg shadow-primary/25 font-bold">
                Rent a Car
              </Button>
              <Button onClick={() => navigate('/create-listing')} variant="outline" pill size="lg" className="font-bold">
                List Yours
              </Button>
            </div>
          </div>

          {/* Right Zone: Car Image (On Blue slanted background) */}
          <div className="flex-1 w-full flex justify-center md:justify-end z-10">
            <img
              src="/hero-car.png"
              alt="Rentica Premium Sports Car"
              className="w-full max-w-md md:max-w-2xl object-contain drop-shadow-[0_20px_50px_rgba(15,15,23,0.15)] md:-mr-12 select-none"
            />
          </div>
        </div>
      </div>

      {/* Floating White Search Card */}
      <div className="relative -mt-10 max-w-5xl mx-auto px-4 md:px-8 w-full z-20">
        <div className="bg-surface text-textPrimary rounded-2xl shadow-xl p-6 md:p-8 border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            {/* Brand */}
            <div className="w-full">
              <Select
                label="Brand"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                placeholder="Any Brand"
                options={[
                  ...availableBrands.map((b) => ({ value: b, label: b })),
                  ...(!availableBrands.includes('Audi') ? [{ value: 'Audi', label: 'Audi' }] : []),
                  ...(!availableBrands.includes('BMW') ? [{ value: 'BMW', label: 'BMW' }] : []),
                  ...(!availableBrands.includes('Mercedes-Benz') ? [{ value: 'Mercedes-Benz', label: 'Mercedes-Benz' }] : []),
                  ...(!availableBrands.includes('Porsche') ? [{ value: 'Porsche', label: 'Porsche' }] : [])
                ]}
              />
            </div>

            {/* Model */}
            <div className="w-full">
              <Select
                label="Model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                placeholder="Any Model"
                options={[
                  { value: 'Sedan', label: 'Sedan' },
                  { value: 'SUV', label: 'SUV' },
                  { value: 'Coupe', label: 'Coupe' }
                ]}
              />
            </div>

            {/* Price Range */}
            <div className="w-full">
              <Select
                label="Price Range"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="Any Price"
                options={[
                  { value: '0-20', label: 'Under ₹20 Lakhs' },
                  { value: '20-50', label: '₹20 - ₹50 Lakhs' },
                  { value: '50-100', label: '₹50 Lakhs - ₹1 Crore' },
                  { value: '100+', label: 'Above ₹1 Crore' }
                ]}
              />
            </div>

            {/* Location */}
            <div className="w-full">
              <Select
                label="Location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="Any Location"
                options={[
                  { value: 'Mumbai', label: 'Mumbai' },
                  { value: 'Delhi', label: 'Delhi' },
                  { value: 'Bangalore', label: 'Bangalore' },
                  { value: 'Pune', label: 'Pune' }
                ]}
              />
            </div>

            {/* Search Button */}
            <div className="w-full">
              <Button
                onClick={handleSearch}
                variant="primary"
                fullWidth
                className="shadow-lg shadow-primary/15 font-bold h-12"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner Strip Container */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full z-10 relative -mt-12 md:-mt-14">
        <div
          className="w-full h-[180px] md:h-[240px] bg-cover bg-center rounded-2xl md:rounded-3xl overflow-hidden flex items-center justify-center relative shadow-lg"
          style={{ backgroundImage: "url('/promo-strip-bg.png')" }}
        >
          <div className="absolute inset-0 bg-black/35" />
          <h2
            className="relative z-10 uppercase m-0 text-center select-none pt-4"
            style={{
              fontFamily: 'Anoxic, sans-serif',
              fontSize: 'clamp(2rem, 4.5vw, 4.5rem)',
              fontWeight: '400',
              letterSpacing: '8px',
              color: 'transparent',
              WebkitTextStroke: '2px var(--color-border)'
            }}
          >
            Rentica
          </h2>
        </div>
      </div>

      {/* Browse by Category Section */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full my-20 text-center">
        <h2 className="text-section-title mb-10">
          Browse by Category
        </h2>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {[
            {
              name: 'SUV',
              image: '/categories/suv.png'
            },
            {
              name: 'Sedan',
              image: '/categories/sedan.png'
            },
            {
              name: 'Hatchback',
              image: '/categories/hatchback.png'
            },
            {
              name: 'Electric',
              image: '/categories/electric.png'
            },
            {
              name: 'Luxury',
              image: '/categories/luxury.png'
            }
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={cat.name === 'Electric' ? '/browse?fuelType=Electric' : `/browse?model=${cat.name}`}
              className="group bg-white border border-gray-100 rounded-2xl py-7 px-4 flex flex-col items-center justify-center gap-4 text-center shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 no-underline"
            >
              <div className="h-14 flex items-center justify-center">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="max-h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-xs font-bold text-gray-800 group-hover:text-primary transition-colors duration-200 uppercase tracking-wide">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Cars Section */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full mb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="text-left">
            <h2 className="text-h2 m-0">
              Featured Premium Rentals
            </h2>
            <p className="text-body mt-2 m-0">
              Explore our handpicked selection of premium rental vehicles available now.
            </p>
          </div>
          <Link to="/browse" className="text-sm font-bold text-primary hover:underline">
            View All Listings &rarr;
          </Link>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredListings.map((car) => (
            <CarCard key={car.id || car._id} car={car} />
          ))}
        </div>
      </div>

      {/* The Rentica Promise Section */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full mb-20">
        <div className="bg-background rounded-card-xl p-8 md:p-16 text-left relative overflow-hidden border border-border/60 shadow-sm">
          {/* Subtle dotted background grid pattern in brand color */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(79,70,229,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />

          <div className="relative z-10">
            <span className="text-primary text-label block">
              The Rentica Promise
            </span>
            <h2 className="text-h1 mt-4 mb-12 leading-tight max-w-2xl">
              Four reasons. <span className="text-primary">Every rental.</span> Built for trust.
            </h2>

            {/* Promises Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 border border-border/60 rounded-2xl bg-surface divide-y md:divide-y-0 md:divide-x divide-border/60 overflow-hidden shadow-sm">
              {[
                {
                  num: '01',
                  title: 'Verified Owners',
                  desc: 'Every car owner on Rentica is identity-verified. You know exactly who you are renting from before you book.'
                },
                {
                  num: '02',
                  title: 'Transparent Pricing',
                  desc: 'Clear daily rates with no hidden fees. The price you see is the price you pay, per day.'
                },
                {
                  num: '03',
                  title: 'Flexible Booking',
                  desc: 'Book for a day, a week, or a month. Our flexible rental model fits every trip and every budget.'
                },
                {
                  num: '04',
                  title: 'Secure Payments',
                  desc: 'All bookings and payments are handled through our secure platform, protecting both renter and owner.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-8 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <span className="text-primary text-small font-mono font-bold block mb-4">
                      {item.num}
                    </span>
                    <h3 className="text-card-title mb-3">
                      {item.title}
                    </h3>
                    <p className="text-body text-xs md:text-sm leading-relaxed m-0">
                      {item.desc}
                    </p>
                  </div>
                  <div className="w-8 h-[2px] bg-primary/40 mt-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full mb-20 text-left">
        <span className="text-primary text-label block mb-3">
          How It Works
        </span>
        <h2 className="text-h1 mt-0 mb-4 leading-tight">
          From search to keys, in <span className="text-primary">three simple steps.</span>
        </h2>
        <p className="text-body text-sm md:text-base max-w-xl leading-relaxed mt-0 mb-12">
          No calls, no agents, no hassle. Just find your car, book it, and drive.
        </p>

        {/* Cards container with connecting line */}
        <div className="relative w-full py-4">
          {/* Connecting line behind cards (desktop only) */}
          <div className="absolute top-[48px] left-[15%] right-[15%] h-[1px] bg-gray-200 hidden lg:block z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="bg-surface rounded-2xl border border-border/70 p-8 flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold text-sm text-textSecondary bg-background/80">
                    1
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-textPrimary mb-2 mt-4">
                  Search Available Rentals
                </h3>
                <p className="text-textSecondary text-sm leading-relaxed m-0">
                  Filter by brand, budget, body type, or location. Every listing shows clear daily pricing and availability dates.
                </p>
              </div>
              <Link to="/browse" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 mt-6">
                Start searching &rarr;
              </Link>
            </div>

            {/* Step 2 */}
            <div className="bg-surface rounded-2xl border border-border/70 p-8 flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold text-sm text-textSecondary bg-background/80">
                    2
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-textPrimary mb-2 mt-4">
                  Compare & Choose
                </h3>
                <p className="text-textSecondary text-sm leading-relaxed m-0">
                  Compare vehicles side by side. Check daily rates, fuel type, transmission, and owner details before you commit.
                </p>
              </div>
              <Link to="/browse" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 mt-6">
                Try Compare &rarr;
              </Link>
            </div>

            {/* Step 3 */}
            <div className="bg-surface rounded-2xl border border-border/70 p-8 flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold text-sm text-textSecondary bg-background/80">
                    3
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-textPrimary mb-2 mt-4">
                  Book & Drive
                </h3>
                <p className="text-textSecondary text-sm leading-relaxed m-0">
                  Send a booking request directly to the owner. Confirm dates, pay securely, and pick up your car — all through Rentica.
                </p>
              </div>
              <Link to="/browse" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 mt-6">
                Contact owners &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>



      {/* Why Choose Us Section */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full mb-20 text-left">
        <div className="bg-surface border border-border rounded-card-xl p-8 md:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Zone: Headline & Paragraph */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                {/* Horizontal line decorator above label */}
                <div className="w-10 h-[3px] bg-primary" />
                <span className="text-primary text-label block">
                  Features
                </span>
              </div>
              <h2 className="text-h2 m-0">
                Why People <span className="text-primary">Choose Rentica?</span>
              </h2>
              <p className="text-body text-sm leading-relaxed m-0">
                Rentica makes car rentals simple, transparent, and trustworthy. No hidden costs, no surprise fees — just the right car at the right price.
              </p>
              <div className="pt-2">
                <Link to="/browse">
                  <Button variant="primary" size="sm" className="font-bold shadow-sm">
                    Explore Listings
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Zone: Staggered Columns with Dividers */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
              {/* Vertical Divider (Only on md and larger) */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-border/80 -translate-x-1/2" />

              {/* Column 1 (Pushed down slightly for staggered hierarchy) */}
              <div className="space-y-8 md:space-y-10 md:pt-10">
                {/* Feature 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border border-primary/10 text-primary bg-primary/5 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-textPrimary m-0">
                      Verified Listings
                    </h3>
                    <p className="text-textSecondary text-xs leading-relaxed m-0">
                      Every car owner is identity-verified and their vehicle is confirmed before it appears on the platform.
                    </p>
                  </div>
                </div>

                {/* Horizontal Divider 1 */}
                <div className="h-[1px] bg-border/80 w-full" />

                {/* Feature 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border border-primary/10 text-primary bg-primary/5 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-textPrimary m-0">
                      Secure & Direct
                    </h3>
                    <p className="text-textSecondary text-xs leading-relaxed m-0">
                      Communicate with owners directly using our integrated booking system with no agent commission or hidden markups.
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-8 md:space-y-10">
                {/* Feature 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border border-primary/10 text-primary bg-primary/5 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-textPrimary m-0">
                      Transparent Rates
                    </h3>
                    <p className="text-textSecondary text-xs leading-relaxed m-0">
                      Clear daily prices with no surprise charges. See exactly what you pay before you book.
                    </p>
                  </div>
                </div>

                {/* Horizontal Divider 2 */}
                <div className="h-[1px] bg-border/80 w-full" />

                {/* Feature 4 */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border border-primary/10 text-primary bg-primary/5 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-textPrimary m-0">
                      Fair Price Insights
                    </h3>
                    <p className="text-textSecondary text-xs leading-relaxed m-0">
                      Real-time valuation based on local market metrics, mileage, condition, and brand algorithms so you pay exactly what is fair.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <ClientFeedback />

      {/* Sell Your Car CTA Banner Section */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full my-20">
        <div className="bg-background rounded-card-xl border border-border p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-visible shadow-sm">
          {/* Left Text */}
          <div className="w-full md:w-[48%] md:max-w-[340px] text-left">
            <h2 className="text-h2 m-0 mb-3">
              List your car in minutes
            </h2>
            <p className="text-body text-sm m-0 leading-relaxed">
              Reach thousands of renters instantly. Earn daily rental income from your vehicle.
            </p>
          </div>

          {/* Overlapping Car Image (Center-Right on Desktop) - Stronger 3D effect extending top and bottom */}
          <img
            src="/cta-car.png"
            alt="Porsche CTA Car"
            className="absolute left-[30%] lg:left-[33%] -top-[16px] h-[calc(100%+32px)] w-auto object-contain drop-shadow-2xl pointer-events-none z-10 hidden md:block"
          />

          {/* Right Button */}
          <div className="w-full md:w-auto z-20 flex md:justify-end">
            <Link to="/create-listing" className="w-full md:w-auto">
              <Button
                variant="dark"
                size="lg"
                className="w-full md:w-auto font-bold shadow-md m-0"
              >
                List Your Car
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;

