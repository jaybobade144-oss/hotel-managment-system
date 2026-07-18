const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel-booking';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    console.log('Cleared existing data.');

    // Create Admin and Customer Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Royal Admin',
      email: 'admin@hotel.com',
      password: 'password123', // Schema pre-save hooks will handle bcrypt encryption, but creating directly handles it
      role: 'admin'
    });

    const customer = await User.create({
      name: 'John Doe',
      email: 'customer@hotel.com',
      password: 'password123',
      role: 'customer'
    });

    const reviewer = await User.create({
      name: 'Jane Smith',
      email: 'jane@hotel.com',
      password: 'password123',
      role: 'customer'
    });

    console.log('Created Users:');
    console.log(`- Admin: admin@hotel.com / password123`);
    console.log(`- Customer 1: customer@hotel.com / password123`);
    console.log(`- Customer 2: jane@hotel.com / password123`);

    // Create Rooms
    const rooms = await Room.create([
      {
        name: 'Serenity Single Cozy Room',
        type: 'Single',
        price: 120,
        description: 'Perfect for solo business travelers or minimalists, this room offers a peaceful sanctuary with a comfortable single bed, dedicated study table, high-speed Wi-Fi, and private bathroom facilities.',
        amenities: ['Wi-Fi', 'AC', 'TV', 'Workspace', 'Minibar'],
        maxGuests: 1,
        imageUrls: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        name: 'Classic Harmony Double Suite',
        type: 'Double',
        price: 180,
        description: 'Ideal for couples or friends traveling together. Equipped with a premium plush queen-size bed, sleek modern interiors, a mini-refrigerator, smart TV, and stunning views of the local gardens.',
        amenities: ['Wi-Fi', 'AC', 'TV', 'Coffee Maker', 'Garden View', 'Mini Fridge'],
        maxGuests: 2,
        imageUrls: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        name: 'Opulent Vista Deluxe Room',
        type: 'Deluxe',
        price: 260,
        description: 'Experience refined elegance with spacious quarters, king-size orthopedic bed, private balcony looking over the cityscape, a marble bathroom, and luxurious designer toiletries.',
        amenities: ['Wi-Fi', 'AC', 'Smart TV', 'Balcony', 'Marble Bathroom', 'Bathrobe', 'Safe'],
        maxGuests: 3,
        imageUrls: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        name: 'The Royal Grand Suite',
        type: 'Suite',
        price: 450,
        description: 'Our crown jewel. A massive suite featuring a separate living parlor, dining area, grand master bedroom with a super king-size bed, deep-soaking hot tub, and premium concierge service access.',
        amenities: ['Wi-Fi', 'AC', '2 Smart TVs', 'Hot Tub', 'Living Room', 'Dining Area', 'Concierge Service', 'Ocean View'],
        maxGuests: 4,
        imageUrls: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]);

    console.log('Created Rooms.');

    // Create Initial Reviews
    await Review.create([
      {
        user: customer._id,
        room: rooms[2]._id, // Deluxe Room
        rating: 5,
        comment: 'Absolutely breathtaking! The balcony views of the city at night were incredible, and the marble bathroom felt like a personal spa. Highly recommended!'
      },
      {
        user: reviewer._id,
        room: rooms[2]._id, // Deluxe Room
        rating: 4,
        comment: 'Very clean and spacious room. The customer service was wonderful. Minor issue with Wi-Fi speed on the balcony but overall excellent!'
      },
      {
        user: customer._id,
        room: rooms[3]._id, // Royal Grand Suite
        rating: 5,
        comment: 'The Royal Grand Suite is worth every penny. The soaking hot tub was pure bliss after a long day of touring. Outstanding service and luxury amenities.'
      },
      {
        user: reviewer._id,
        room: rooms[0]._id, // Single Room
        rating: 4,
        comment: 'A compact and tidy space that has everything a solo traveler needs. The bed was extremely comfortable, and the desk workspace was perfect for getting emails done.'
      }
    ]);

    console.log('Created Seed Reviews.');
    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
