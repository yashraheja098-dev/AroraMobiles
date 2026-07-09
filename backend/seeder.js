const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeder');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@aroramobiles.com' });
    
    if (adminExists) {
      console.log('Admin user already exists!');
    } else {
      await User.create({
        name: 'Admin User',
        email: 'admin@aroramobiles.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'admin',
      });
      console.log('Admin user created successfully! (email: admin@aroramobiles.com, password: password123)');
    }
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

importData();
