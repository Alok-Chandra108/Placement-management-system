require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin.model');

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || '11mt25mca082-t@mite.ac.in';

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    const password = process.argv[2] || 'TempAdmin@123';

    if (existingAdmin) {
      console.log(`Admin with email ${adminEmail} already exists. Updating password...`);
      existingAdmin.password = password;
      await existingAdmin.save();
      console.log('✅ Password updated successfully!');
      process.exit(0);
    }

    // Create the admin user
    // Now using the slim Admin schema
    const newAdmin = new Admin({
      fullName: 'Super Admin',
      email: adminEmail,
      password: password,
      role: 'admin',
      isVerified: true,
    });

    // The pre-save hook in Admin.model.js will automatically hash the password
    await newAdmin.save();

    console.log('----------------------------------------------------');
    console.log('✅ Super Admin successfully created in Admins collection!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${password}`);
    console.log('----------------------------------------------------');
    console.log('Please log in and change your password if using the default.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
