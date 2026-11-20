const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Listing = require('../models/Listing');


// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rentica';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');

    // 1. Clear Existing Data Completely
    console.log('Clearing all existing users and listings...');
    await Listing.deleteMany({});
    await User.deleteMany({});
    console.log('Existing database records wiped clean.');

    // 2. Seed Users with password "123"
    console.log('Creating seeded user accounts (Password: 123)...');
    
    const usersData = [
      {
        name: 'Arsalaan Khan',
        email: 'seller@rentica.com',
        password: '123',
        role: 'user',
        phone: '+919876543210',
        responseRate: 98,
        pastDealsCount: 14
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@rentica.com',
        password: '123',
        role: 'user',
        phone: '+919811223344',
        responseRate: 92,
        pastDealsCount: 8
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@rentica.com',
        password: '123',
        role: 'user',
        phone: '+919822334455',
        responseRate: 95,
        pastDealsCount: 11
      },
      {
        name: 'Vikramaditya Singh',
        email: 'vikram.singh@rentica.com',
        password: '123',
        role: 'user',
        phone: '+919833445566',
        responseRate: 89,
        pastDealsCount: 5
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@rentica.com',
        password: '123',
        role: 'user',
        phone: '+919844556677',
        responseRate: 96,
        pastDealsCount: 18
      },
      {
        name: 'rentica Admin',
        email: 'admin@rentica.com',
        password: '123',
        role: 'admin',
        phone: '+919999999999',
        responseRate: 100,
        pastDealsCount: 50
      }
    ];

    const createdUsers = {};
    for (const uData of usersData) {
      const u = new User(uData);
      await u.save();
      createdUsers[uData.email] = u;
      console.log(`Created user: ${uData.name} (${uData.email}) [Role: ${uData.role}]`);
    }

    // 3. Define Comprehensive Edge-Case Listings Data
    // Uses real dataset images from data1 (healthy_car_X.jpg and damaged_car_X.jpg)
    const rawListings = [
      {
        sellerEmail: 'seller@rentica.com',
        brand: 'Mercedes-Benz',
        model: 'E-Class E200',
        year: 2021,
        kmDriven: 18500,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        bodyType: 'Sedan',
        location: 'Mumbai, Maharashtra',
        price: 4800000,
        description: 'Single-owner Mercedes E-Class. Kept in pristine condition, serviced regularly at authorised dealership. Original paint, zero accidents, full insurance cover.',
        images: ['uploads/healthy_car_1.jpg', 'uploads/healthy_car_2.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'rahul.sharma@rentica.com',
        brand: 'Hyundai',
        model: 'i20 Asta',
        year: 2020,
        kmDriven: 34000,
        fuelType: 'Petrol',
        transmission: 'Manual',
        bodyType: 'Hatchback',
        location: 'Bengaluru, Karnataka',
        price: 650000,
        description: 'Hyundai i20. Mechanically sound. Scanned by CNN condition model: minor front bumper scratches and door paint wear detected from dataset photos.',
        images: ['uploads/damaged_car_1.jpg', 'uploads/damaged_car_2.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'priya.patel@rentica.com',
        brand: 'Audi',
        model: 'A4 35 TDI',
        year: 2019,
        kmDriven: 52000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        bodyType: 'Sedan',
        location: 'Delhi, NCR',
        price: 3200000,
        description: 'Audi A4 in pristine white. Mechanically sound and well-kept but listed slightly above regional market value.',
        images: ['uploads/healthy_car_3.jpg', 'uploads/healthy_car_4.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'vikram.singh@rentica.com',
        brand: 'BMW',
        model: '3 Series 320d',
        year: 2018,
        kmDriven: 85000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        bodyType: 'Sedan',
        location: 'Pune, Maharashtra',
        price: 2100000,
        description: 'BMW 3 Series. High mileage highway cruiser. Priced 18% below market average for an urgent sale.',
        images: ['uploads/healthy_car_5.jpg', 'uploads/healthy_car_6.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'ananya.iyer@rentica.com',
        brand: 'Toyota',
        model: 'Fortuner 4x4',
        year: 2022,
        kmDriven: 21000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        bodyType: 'SUV',
        location: 'Hyderabad, Telangana',
        price: 3900000,
        description: 'Immaculate Fortuner 4x4 Automatic. Leather seats, off-road package, complete service logs available.',
        images: ['uploads/healthy_car_7.jpg', 'uploads/healthy_car_8.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'rahul.sharma@rentica.com',
        brand: 'Honda',
        model: 'City V',
        year: 2022,
        kmDriven: 4500,
        fuelType: 'Petrol',
        transmission: 'Manual',
        bodyType: 'Sedan',
        location: 'Ahmedabad, Gujarat',
        price: 400000, // Suspicious underpriced scam prompt
        description: 'Brand new Honda City. Single owner. Relocating abroad, urgent sale. Pay a 10% advance deposit to secure deal.',
        images: ['uploads/damaged_car_3.jpg'],
        status: 'pending_review' // Auto-flagged high risk
      },
      {
        sellerEmail: 'priya.patel@rentica.com',
        brand: 'Maruti Suzuki',
        model: 'Swift ZXi',
        year: 2023,
        kmDriven: 12000,
        fuelType: 'Petrol',
        transmission: 'Manual',
        bodyType: 'Hatchback',
        location: 'Chandigarh, Punjab',
        price: 720000,
        description: 'Near-new Maruti Swift in pristine mint condition. Extended warranty active, touch screen infotainment, zero scratch body.',
        images: ['uploads/healthy_car_9.jpg', 'uploads/healthy_car_10.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'vikram.singh@rentica.com',
        brand: 'Mahindra',
        model: 'Thar CRDe 4x4',
        year: 2017,
        kmDriven: 68000,
        fuelType: 'Diesel',
        transmission: 'Manual',
        bodyType: 'SUV',
        location: 'Jaipur, Rajasthan',
        price: 850000,
        description: 'Off-road Mahindra Thar. Scanned by CNN model: surface scratches and trail scuffs on side fender panel.',
        images: ['uploads/damaged_car_4.jpg', 'uploads/damaged_car_5.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'ananya.iyer@rentica.com',
        brand: 'Kia',
        model: 'Seltos GTX Plus',
        year: 2021,
        kmDriven: 29000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        bodyType: 'SUV',
        location: 'Chennai, Tamil Nadu',
        price: 1580000,
        description: 'Top end Kia Seltos GTX Plus with Bose sound system, ventilated seats, and 360 camera.',
        images: ['uploads/healthy_car_1.jpg', 'uploads/healthy_car_3.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'seller@rentica.com',
        brand: 'Toyota',
        model: 'Innova Crysta 2.4 Z',
        year: 2016,
        kmDriven: 165000,
        fuelType: 'Diesel',
        transmission: 'Manual',
        bodyType: 'SUV',
        location: 'Kochi, Kerala',
        price: 1450000,
        description: 'High mileage long distance Innova Crysta. Engine re-conditioned, immaculate mechanical condition, minor body wear.',
        images: ['uploads/healthy_car_5.jpg', 'uploads/healthy_car_7.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'rahul.sharma@rentica.com',
        brand: 'Tata',
        model: 'Nexon EV Max',
        year: 2023,
        kmDriven: 8200,
        fuelType: 'Electric',
        transmission: 'Automatic',
        bodyType: 'SUV',
        location: 'Noida, Uttar Pradesh',
        price: 1620000,
        description: 'Tata Nexon EV Max with fast charger included. Single owner, pristine battery health, full service record.',
        images: ['uploads/healthy_car_2.jpg', 'uploads/healthy_car_4.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'vikram.singh@rentica.com',
        brand: 'Ford',
        model: 'Mustang GT 5.0 V8',
        year: 2019,
        kmDriven: 14000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        bodyType: 'Coupe',
        location: 'Mumbai, Maharashtra',
        price: 6200000,
        description: 'Iconic Ford Mustang 5.0L V8 Coupe. Borla exhaust, enthusiast owned, listed at collector price premium.',
        images: ['uploads/healthy_car_6.jpg', 'uploads/healthy_car_8.jpg'],
        status: 'active'
      },
      {
        sellerEmail: 'priya.patel@rentica.com',
        brand: 'Volkswagen',
        model: 'Polo GT TSI',
        year: 2020,
        kmDriven: 41000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        bodyType: 'Hatchback',
        location: 'Kolkata, West Bengal',
        price: 820000,
        description: 'Volkswagen Polo GT TSI. Moderation rejected due to unverified registration credentials.',
        images: ['uploads/damaged_car_6.jpg'],
        status: 'rejected',
        rejectionReason: 'Invalid vehicle registration document provided during moderation review.'
      },
      {
        sellerEmail: 'ananya.iyer@rentica.com',
        brand: 'Hyundai',
        model: 'Creta SX(O)',
        year: 2021,
        kmDriven: 31000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        bodyType: 'SUV',
        location: 'Surat, Gujarat',
        price: 1390000,
        description: 'Panoramic sunroof Hyundai Creta. Deal finalized and sold.',
        images: ['uploads/healthy_car_10.jpg'],
        status: 'sold'
      }
    ];

    console.log('\nSeeding listings...');
    const populatedListings = [];

    for (const item of rawListings) {
      const seller = createdUsers[item.sellerEmail];

      populatedListings.push({
        seller: seller._id,
        brand: item.brand,
        model: item.model,
        year: item.year,
        kmDriven: item.kmDriven,
        fuelType: item.fuelType,
        transmission: item.transmission,
        bodyType: item.bodyType,
        location: item.location,
        price: item.price,
        description: item.description,
        images: item.images,
        conditionScore: 85,
        detectedDamages: [],
        predictedPriceMin: Math.round(item.price * 0.92),
        predictedPriceMax: Math.round(item.price * 1.08),
        predictedPriceMedian: item.price,
        confidenceLevel: 'High',
        featureImportance: { year: 0.40, km_driven: -0.25, condition_score: 0.35 },
        riskFlag: (item.status === 'pending_review' ? 'High' : 'Low'),
        fraudProbability: (item.status === 'pending_review' ? 0.94 : 0.03),
        fraudReasons: [],
        trustScore: (item.status === 'pending_review' ? 18 : 88),
        trustBreakdown: { price_fairness: 32.0, fraud_risk: 28.5, condition_match: 20.0, seller_factor: 7.5 },
        status: item.status,
        rejectionReason: item.rejectionReason || null
      });
    }

    await Listing.insertMany(populatedListings);
    console.log('\n============================================================');
    console.log('Database seeded successfully from scratch!');
    console.log(`Seeded Users: ${Object.keys(createdUsers).length} (Password for all: "123")`);
    console.log(`Seeded Listings: ${populatedListings.length} (Covering active, damaged, scam, rejected, and sold edge cases)`);
    console.log('Images attached from data1 dataset: healthy_car_X.jpg & damaged_car_X.jpg');
    console.log('============================================================\n');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    try {
      await mongoose.connection.close();
    } catch (e) {}
    process.exit(1);
  }
};

seedDatabase();

