const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Listing = require('./models/Listing');
const Booking = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rentica';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing collections (Users, Listings, Bookings)...');

    // 1. Create Users
    console.log('Creating Users...');

    const admin = await User.create({
      name: 'Rentica Admin',
      email: 'admin@rentica.com',
      password: 'password123',
      role: 'admin',
      phone: '+91 98765 43210'
    });

    const ownerRohan = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 98123 45678'
    });

    const ownerPriya = await User.create({
      name: 'Priya Verma',
      email: 'priya.verma@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 97123 45678'
    });

    const ownerVikram = await User.create({
      name: 'Vikram Aditya',
      email: 'vikram.aditya@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 96123 45678'
    });

    const renterRahul = await User.create({
      name: 'Rahul Mehta',
      email: 'rahul.mehta@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 95123 45678'
    });

    const ownerAnanya = await User.create({
      name: 'Ananya Roy',
      email: 'ananya.roy@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 94123 45678'
    });

    console.log(`Created 6 users successfully.`);

    // 2. Create Rental Car Listings
    console.log('Creating Rental Car Listings...');

    // Listing 1: Luxury Sedan
    const listing1 = await Listing.create({
      owner: ownerRohan._id,
      brand: 'BMW',
      model: '5 Series',
      year: 2022,
      kmDriven: 14500,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      location: 'Mumbai',
      pricePerDay: 120,
      availableFrom: new Date('2025-01-01'),
      availableTo: new Date('2025-12-31'),
      description: 'Meticulously maintained BMW 530d M Sport in Carbon Black. Perfect for business trips and special occasions. Full insurance included.',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active'
    });

    // Listing 2: Luxury SUV
    const listing2 = await Listing.create({
      owner: ownerRohan._id,
      brand: 'Audi',
      model: 'Q7',
      year: 2021,
      kmDriven: 28000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'SUV',
      location: 'Delhi',
      pricePerDay: 150,
      availableFrom: new Date('2025-01-01'),
      availableTo: new Date('2025-12-31'),
      description: 'Audi Q7 Technology 45 TFSI Quattro in Mythos Black. Panoramic sunroof, 7 seats, perfect for family trips.',
      images: [
        'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active'
    });

    // Listing 3: Sedan
    const listing3 = await Listing.create({
      owner: ownerPriya._id,
      brand: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2019,
      kmDriven: 42000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      location: 'Bangalore',
      pricePerDay: 90,
      description: 'Mercedes C200 Progressive trim. Polar White exterior, premium sound system. Ideal for city driving.',
      images: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active'
    });

    // Listing 4: Luxury Sports
    const listing4 = await Listing.create({
      owner: ownerVikram._id,
      brand: 'Porsche',
      model: '911',
      year: 2023,
      kmDriven: 4500,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Coupe',
      location: 'Mumbai',
      pricePerDay: 250,
      availableFrom: new Date('2025-02-01'),
      availableTo: new Date('2025-11-30'),
      description: 'Porsche 911 Carrera S in Crayon Gray. Sport Chrono package, perfect for weekend drives. Unforgettable experience guaranteed.',
      images: [
        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active'
    });

    // Listing 5: Compact SUV (Budget friendly)
    const listing5 = await Listing.create({
      owner: renterRahul._id,
      brand: 'Hyundai',
      model: 'Creta',
      year: 2020,
      kmDriven: 35000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      bodyType: 'SUV',
      location: 'Pune',
      pricePerDay: 65,
      description: 'Hyundai Creta 1.4 Turbo SX. Comfortable family SUV, great for road trips. Fuel efficient and spacious.',
      images: [
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active'
    });

    // Listing 6: Electric SUV
    const listing6 = await Listing.create({
      owner: ownerPriya._id,
      brand: 'Tata',
      model: 'Nexon EV',
      year: 2022,
      kmDriven: 19000,
      fuelType: 'Electric',
      transmission: 'Automatic',
      bodyType: 'SUV',
      location: 'Hyderabad',
      pricePerDay: 80,
      availableFrom: new Date('2025-01-01'),
      availableTo: new Date('2025-12-31'),
      description: 'Tata Nexon EV Max. Eco-friendly electric SUV with 400+ km range. Fast charger included. Perfect for city and highway.',
      images: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active'
    });

    // Listing 7: Sedan (pending review)
    const listing7 = await Listing.create({
      owner: ownerRohan._id,
      brand: 'Honda',
      model: 'City',
      year: 2018,
      kmDriven: 58000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      location: 'Chennai',
      pricePerDay: 45,
      description: 'Honda City ZX CVT. Reliable city sedan with sunroof and LED headlights. Great fuel economy.',
      images: [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'pending_review'
    });

    // Listing 8: Hatchback (budget)
    const listing8 = await Listing.create({
      owner: ownerRohan._id,
      brand: 'Maruti Suzuki',
      model: 'Swift',
      year: 2017,
      kmDriven: 64000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      bodyType: 'Hatchback',
      location: 'Ahmedabad',
      pricePerDay: 35,
      description: 'Maruti Suzuki Swift. Perfect budget rental for city commutes. Excellent fuel economy.',
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active'
    });

    // Listing 9: Off-road SUV (pending review)
    const listing9 = await Listing.create({
      owner: ownerAnanya._id,
      brand: 'Mahindra',
      model: 'Thar',
      year: 2022,
      kmDriven: 11200,
      fuelType: 'Diesel',
      transmission: 'Manual',
      bodyType: 'Convertible',
      location: 'Jaipur',
      pricePerDay: 95,
      description: 'Mahindra Thar LX Hard Top 4WD Diesel. Ultimate off-road adventure vehicle. Perfect for hill trips and safaris.',
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'pending_review'
    });

    // Listing 10: SUV (pending review)
    const listing10 = await Listing.create({
      owner: ownerVikram._id,
      brand: 'Toyota',
      model: 'Fortuner',
      year: 2021,
      kmDriven: 32000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      bodyType: 'SUV',
      location: 'Chandigarh',
      pricePerDay: 110,
      description: 'Toyota Fortuner 2.8 4x4 AT. Premium 7-seater SUV for family road trips. Excellent comfort and reliability.',
      images: [
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'pending_review'
    });

    // Listing 11: Rejected listing
    const listing11 = await Listing.create({
      owner: ownerAnanya._id,
      brand: 'Ford',
      model: 'Mustang',
      year: 2018,
      kmDriven: 25000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Coupe',
      location: 'Kolkata',
      pricePerDay: 180,
      description: 'Ford Mustang 5.0 V8 GT. American muscle car experience.',
      images: [
        'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'rejected',
      rejectionReason: 'Vehicle documentation could not be verified.'
    });

    // Listing 12: Hatchback (no images)
    const listing12 = await Listing.create({
      owner: ownerPriya._id,
      brand: 'Maruti Suzuki',
      model: 'Baleno',
      year: 2021,
      kmDriven: 22000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Hatchback',
      location: 'Delhi',
      pricePerDay: 40,
      description: 'Maruti Suzuki Baleno Alpha CVT. Smooth automatic hatchback for city rental.',
      images: [],
      status: 'active'
    });

    // Listing 13: Budget Hatchback
    const listing13 = await Listing.create({
      owner: renterRahul._id,
      brand: 'Volkswagen',
      model: 'Polo',
      year: 2015,
      kmDriven: 85000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      bodyType: 'Hatchback',
      location: 'Pune',
      pricePerDay: 35,
      description: 'Volkswagen Polo 1.2 MPI. Dependable city hatchback. Well maintained, great for short trips.',
      images: [
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active'
    });

    // Listing 14: Hybrid Sedan
    const listing14 = await Listing.create({
      owner: ownerAnanya._id,
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      kmDriven: 9800,
      fuelType: 'Hybrid',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      location: 'Gurgaon',
      pricePerDay: 100,
      availableFrom: new Date('2025-01-01'),
      availableTo: new Date('2025-12-31'),
      description: 'Toyota Camry Hybrid. Self-charging hybrid sedan. Whisper-quiet cabin, premium comfort, great fuel efficiency.',
      images: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active'
    });

    // Listing 15: Luxury Convertible
    const listing15 = await Listing.create({
      owner: ownerVikram._id,
      brand: 'BMW',
      model: 'Z4',
      year: 2022,
      kmDriven: 8200,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Convertible',
      location: 'Mumbai',
      pricePerDay: 200,
      availableFrom: new Date('2025-03-01'),
      availableTo: new Date('2025-10-31'),
      description: 'BMW Z4 M40i Roadster. Open-top driving experience in San Francisco Red. Perfect for scenic coastal drives.',
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active'
    });

    console.log(`Created 15 rental listings across all statuses (pricePerDay: $35–$250/day).`);
    console.log(`  Sedan $45/day, SUV $65/day, Luxury $120/day, Electric $80/day, Hatchback $35/day`);

    // 3. Link Wishlist Items to Rahul Mehta
    renterRahul.savedListings = [listing1._id, listing4._id, listing6._id, listing14._id];
    await renterRahul.save();
    console.log(`Saved 4 listings to Rahul Mehta's wishlist.`);

    // 4. Create Sample Bookings
    const booking1 = await Booking.create({
      listing: listing1._id,
      renter: renterRahul._id,
      owner: ownerRohan._id,
      startDate: new Date('2025-02-10'),
      endDate: new Date('2025-02-13'),
      duration: 3,
      totalCost: 360,
      status: 'confirmed',
      message: 'Hi Rohan, I would like to rent the BMW for a business trip.'
    });

    const booking2 = await Booking.create({
      listing: listing6._id,
      renter: renterRahul._id,
      owner: ownerPriya._id,
      startDate: new Date('2025-03-05'),
      endDate: new Date('2025-03-08'),
      duration: 3,
      totalCost: 240,
      status: 'pending',
      message: 'Hi Priya, interested in the Nexon EV for a weekend trip.'
    });

    console.log(`Created 2 sample bookings (${booking1._id}, ${booking2._id}).`);

    console.log('\n==========================================');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('Test User Login Credentials:');
    console.log('1. Admin:          admin@rentica.com / password123');
    console.log('2. Owner:          rohan.sharma@example.com / password123');
    console.log('3. Owner:          priya.verma@example.com / password123');
    console.log('4. Owner:          vikram.aditya@example.com / password123');
    console.log('5. Renter:         rahul.mehta@example.com / password123');
    console.log('6. Owner:          ananya.roy@example.com / password123');
    console.log('==========================================');
    console.log('Sample pricePerDay values:');
    console.log('  Hatchback: $35/day | Sedan: $45/day | SUV: $65/day');
    console.log('  Electric: $80/day | Luxury: $120/day | Sports: $250/day');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
