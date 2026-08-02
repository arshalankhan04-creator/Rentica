const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Listing = require('./models/Listing');
const Inquiry = require('./models/Inquiry');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/valora_anti';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Inquiry.deleteMany({});
    console.log('Cleared existing collections (Users, Listings, Inquiries)...');

    // 1. Create Users
    console.log('Creating Users...');

    const admin = await User.create({
      name: 'Valora Admin',
      email: 'admin@valora.com',
      password: 'password123',
      role: 'admin',
      phone: '+91 98765 43210'
    });

    const sellerRohan = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 98123 45678'
    });

    const sellerPriya = await User.create({
      name: 'Priya Verma',
      email: 'priya.verma@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 97123 45678'
    });

    const sellerVikram = await User.create({
      name: 'Vikram Aditya',
      email: 'vikram.aditya@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 96123 45678'
    });

    const buyerRahul = await User.create({
      name: 'Rahul Mehta',
      email: 'rahul.mehta@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 95123 45678'
    });

    const sellerAnanya = await User.create({
      name: 'Ananya Roy',
      email: 'ananya.roy@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 94123 45678'
    });

    console.log(`Created 6 users successfully.`);

    // 2. Create Car Listings
    console.log('Creating Car Listings...');

    // Listing 1: Active Luxury Sedan
    const listing1 = await Listing.create({
      seller: sellerRohan._id,
      brand: 'BMW',
      model: '5 Series',
      year: 2022,
      kmDriven: 14500,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      location: 'Mumbai',
      price: 5400000,
      description: 'Meticulously maintained BMW 530d M Sport in Carbon Black. Single owner, full dealer service history, extended warranty valid till 2026. Zero accident record.',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 9.2,
      predictedPriceMin: 5200000,
      predictedPriceMax: 5600000,
      riskFlag: 'Low',
      trustScore: 94,
      status: 'active'
    });

    // Listing 2: Active Luxury SUV
    const listing2 = await Listing.create({
      seller: sellerRohan._id,
      brand: 'Audi',
      model: 'Q7',
      year: 2021,
      kmDriven: 28000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'SUV',
      location: 'Delhi',
      price: 6800000,
      description: 'Audi Q7 Technology 45 TFSI Quattro in Mythos Black. Panoramic sunroof, Matrix LED headlights, Bang & Olufsen 3D sound system. Impeccable condition.',
      images: [
        'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 8.8,
      predictedPriceMin: 6500000,
      predictedPriceMax: 7100000,
      riskFlag: 'Low',
      trustScore: 88,
      status: 'active'
    });

    // Listing 3: Active Sedan with NULL scores (Edge Case: N/A testing)
    const listing3 = await Listing.create({
      seller: sellerPriya._id,
      brand: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2019,
      kmDriven: 42000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      location: 'Bangalore',
      price: 3200000,
      description: 'Mercedes C200 Progressive trim. Polar White exterior with Macchiato Beige interior. Clean vehicle history, non-smoker owned.',
      images: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: null,
      predictedPriceMin: null,
      predictedPriceMax: null,
      trustScore: null,
      status: 'active'
    });

    // Listing 4: High End Sports Coupe
    const listing4 = await Listing.create({
      seller: sellerVikram._id,
      brand: 'Porsche',
      model: '911',
      year: 2023,
      kmDriven: 4500,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Coupe',
      location: 'Mumbai',
      price: 18500000,
      description: 'Porsche 911 Carrera S in Crayon Gray. Sport Chrono package, PASM sport suspension, RS Spyder wheels, Sport Exhaust. Mint condition garage queen.',
      images: [
        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 9.7,
      predictedPriceMin: 18000000,
      predictedPriceMax: 19500000,
      riskFlag: 'Low',
      trustScore: 96,
      status: 'active'
    });

    // Listing 5: Popular Compact SUV
    const listing5 = await Listing.create({
      seller: buyerRahul._id,
      brand: 'Hyundai',
      model: 'Creta',
      year: 2020,
      kmDriven: 35000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      bodyType: 'SUV',
      location: 'Pune',
      price: 1350000,
      description: 'Hyundai Creta 1.4 Turbo SX (O) in Titan Grey. Dual tone interior, ventilated seats, Bose premium audio, blue link connected car tech.',
      images: [
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 8.5,
      predictedPriceMin: 1300000,
      predictedPriceMax: 1420000,
      riskFlag: 'Low',
      trustScore: 82,
      status: 'active'
    });

    // Listing 6: Electric SUV
    const listing6 = await Listing.create({
      seller: sellerPriya._id,
      brand: 'Tata',
      model: 'Nexon EV',
      year: 2022,
      kmDriven: 19000,
      fuelType: 'Electric',
      transmission: 'Automatic',
      bodyType: 'SUV',
      location: 'Hyderabad',
      price: 1480000,
      description: 'Tata Nexon EV Max XZ+ Lux in Intensi-Teal. 40.5 kWh battery pack, fast charger included, leatherette seats, auto-dimming IRVM.',
      images: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 8.6,
      predictedPriceMin: 1400000,
      predictedPriceMax: 1520000,
      riskFlag: 'Low',
      trustScore: 87,
      status: 'active'
    });

    // Listing 7: Sold Sedan
    const listing7 = await Listing.create({
      seller: sellerRohan._id,
      brand: 'Honda',
      model: 'City',
      year: 2018,
      kmDriven: 58000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      location: 'Chennai',
      price: 820000,
      description: 'Honda City ZX CVT i-VTEC. Top model with 6 airbags, LED headlights, sunroof, diamond cut alloy wheels.',
      images: [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 8.0,
      predictedPriceMin: 780000,
      predictedPriceMax: 850000,
      trustScore: 85,
      status: 'sold'
    });

    // Listing 8: Sold Hatchback CNG
    const listing8 = await Listing.create({
      seller: sellerRohan._id,
      brand: 'Maruti Suzuki',
      model: 'Swift',
      year: 2017,
      kmDriven: 64000,
      fuelType: 'CNG',
      transmission: 'Manual',
      bodyType: 'Hatchback',
      location: 'Ahmedabad',
      price: 480000,
      description: 'Maruti Suzuki Swift ZXi with company fitted CNG. Excellent fuel economy, well maintained city commuter car.',
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 7.8,
      predictedPriceMin: 450000,
      predictedPriceMax: 500000,
      trustScore: 80,
      status: 'sold'
    });

    // Listing 9: Edge Case — Pending Review & High Risk Flag (Admin Queue Test)
    const listing9 = await Listing.create({
      seller: sellerAnanya._id,
      brand: 'Mahindra',
      model: 'Thar',
      year: 2022,
      kmDriven: 11200,
      fuelType: 'Diesel',
      transmission: 'Manual',
      bodyType: 'Convertible',
      location: 'Jaipur',
      price: 1390000,
      description: 'Mahindra Thar LX Hard Top 4WD Diesel MT. Convertible soft top included. Off-road bumper installed.',
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 8.1,
      predictedPriceMin: 1320000,
      predictedPriceMax: 1450000,
      riskFlag: 'High',
      trustScore: 68,
      status: 'pending_review'
    });

    // Listing 10: Edge Case — Pending Review (Standard Admin Queue)
    const listing10 = await Listing.create({
      seller: sellerVikram._id,
      brand: 'Toyota',
      model: 'Fortuner',
      year: 2021,
      kmDriven: 32000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      bodyType: 'SUV',
      location: 'Chandigarh',
      price: 3650000,
      description: 'Toyota Fortuner 2.8 4x4 AT in Super White. Full service records with Toyota dealership. Excellent condition.',
      images: [
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 9.0,
      predictedPriceMin: 3500000,
      predictedPriceMax: 3800000,
      riskFlag: 'Medium',
      trustScore: 89,
      status: 'pending_review'
    });

    // Listing 11: Edge Case — Rejected Status with Rejection Reason
    const listing11 = await Listing.create({
      seller: sellerAnanya._id,
      brand: 'Ford',
      model: 'Mustang',
      year: 2018,
      kmDriven: 25000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Coupe',
      location: 'Kolkata',
      price: 5200000,
      description: 'Ford Mustang 5.0 V8 GT Fastback. Red exterior with black leather upholstery.',
      images: [
        'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 7.2,
      predictedPriceMin: 4800000,
      predictedPriceMax: 5400000,
      riskFlag: 'High',
      trustScore: 60,
      status: 'rejected',
      rejectionReason: 'Vehicle documentation could not be verified and pricing appears suspicious.'
    });

    // Listing 12: Edge Case — No Images Array (Fallback Placeholder Image Test)
    const listing12 = await Listing.create({
      seller: sellerPriya._id,
      brand: 'Maruti Suzuki',
      model: 'Baleno',
      year: 2021,
      kmDriven: 22000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Hatchback',
      location: 'Delhi',
      price: 690000,
      description: 'Maruti Suzuki Baleno Alpha CVT. Nexus Blue, single hand driven, pristine interior.',
      images: [], // Empty images array to test placeholder image rendering
      conditionScore: 8.3,
      predictedPriceMin: 650000,
      predictedPriceMax: 720000,
      trustScore: 84,
      status: 'active'
    });

    // Listing 13: Edge Case — Budget / Older Model Car
    const listing13 = await Listing.create({
      seller: buyerRahul._id,
      brand: 'Volkswagen',
      model: 'Polo',
      year: 2015,
      kmDriven: 85000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      bodyType: 'Hatchback',
      location: 'Pune',
      price: 280000,
      description: 'Volkswagen Polo 1.2 MPI Highline. Flash Red, well maintained engine, new battery installed recently.',
      images: [
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 7.0,
      predictedPriceMin: 250000,
      predictedPriceMax: 300000,
      trustScore: 76,
      status: 'active'
    });

    // Listing 14: Hybrid Sedan
    const listing14 = await Listing.create({
      seller: sellerAnanya._id,
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      kmDriven: 9800,
      fuelType: 'Hybrid',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      location: 'Gurgaon',
      price: 4150000,
      description: 'Toyota Camry Hybrid 2.5 Elegance. Self-charging electric hybrid powertrain, rear recliner seats, JBL 9-speaker system.',
      images: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 9.4,
      predictedPriceMin: 4000000,
      predictedPriceMax: 4300000,
      trustScore: 95,
      status: 'active'
    });

    // Listing 15: Luxury Convertible
    const listing15 = await Listing.create({
      seller: sellerVikram._id,
      brand: 'BMW',
      model: 'Z4',
      year: 2022,
      kmDriven: 8200,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      bodyType: 'Convertible',
      location: 'Mumbai',
      price: 7200000,
      description: 'BMW Z4 M40i Roadster in San Francisco Red. Soft top convertible, M Sport differential, adaptive M suspension.',
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
      ],
      conditionScore: 9.5,
      predictedPriceMin: 7000000,
      predictedPriceMax: 7500000,
      trustScore: 93,
      status: 'active'
    });

    console.log(`Created 15 listings across all statuses and edge cases.`);

    // 3. Link Wishlist Items to Rahul Mehta
    buyerRahul.savedListings = [listing1._id, listing4._id, listing6._id, listing14._id];
    await buyerRahul.save();
    console.log(`Saved 4 listings to Rahul Mehta's wishlist.`);

    // 4. Create Inquiry / Chat Threads
    const inquiry1 = await Inquiry.create({
      listing: listing1._id,
      buyer: buyerRahul._id,
      seller: sellerRohan._id,
      messages: [
        {
          sender: buyerRahul._id,
          text: 'Hi Rohan, I am interested in your BMW 5 Series. Is it available for an inspection in Bandra?',
          sentAt: new Date(Date.now() - 3600000 * 5)
        },
        {
          sender: sellerRohan._id,
          text: 'Hi Rahul! Yes, the car is available. We can schedule an inspection tomorrow afternoon around 4 PM.',
          sentAt: new Date(Date.now() - 3600000 * 2)
        }
      ]
    });

    const inquiry2 = await Inquiry.create({
      listing: listing6._id,
      buyer: buyerRahul._id,
      seller: sellerPriya._id,
      messages: [
        {
          sender: buyerRahul._id,
          text: 'Hi Priya, what is the battery health percentage and real-world range on the Nexon EV?',
          sentAt: new Date(Date.now() - 3600000 * 12)
        },
        {
          sender: sellerPriya._id,
          text: 'Hello Rahul! Battery state of health is at 99%. Real world city range is around 310 km on a full charge.',
          sentAt: new Date(Date.now() - 3600000 * 8)
        }
      ]
    });

    console.log(`Created 2 active Inquiry threads (${inquiry1._id}, ${inquiry2._id}).`);

    console.log('\n==========================================');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('Test User Login Credentials:');
    console.log('1. Admin:           admin@valora.com / password123');
    console.log('2. Verified Seller: rohan.sharma@example.com / password123');
    console.log('3. Seller:          priya.verma@example.com / password123');
    console.log('4. Collector:       vikram.aditya@example.com / password123');
    console.log('5. Buyer:           rahul.mehta@example.com / password123');
    console.log('6. Seller (Ananya): ananya.roy@example.com / password123');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
