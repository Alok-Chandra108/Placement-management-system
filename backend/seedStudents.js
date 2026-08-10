/**
 * Script to seed students for testing purposes.
 * It creates 10 students for each department (excluding MCA).
 * Total students created: 140
 *
 * Test Accounts Pattern:
 * Email: teststudent<Number>@mite.ac.in
 * Password: Password123!
 *
 * Examples:
 * teststudent1@mite.ac.in to teststudent10@mite.ac.in -> Aeronautical Engineering
 * teststudent11@mite.ac.in to teststudent20@mite.ac.in -> Artificial Intelligence & Machine Learning
 * ...and so on.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.model');
const StudentProfile = require('./models/StudentProfile.model');

const departments = [
  'Aeronautical Engineering',
  'Artificial Intelligence & Machine Learning',
  'Civil Engineering',
  'Computer Science & Engineering',
  'Computer Science & Engineering (Artificial Intelligence & Machine Learning)',
  'Computer Science & Engineering (IoT & Cyber Security with Blockchain Technology)',
  'Electronics & Communication Engineering',
  'Information Science & Engineering',
  'Mechanical Engineering',
  'Mechatronics Engineering',
  'Robotics & Artificial Intelligence',
  'MBA (Master of Business Administration)',
  'M.Tech in Computer Science & Engineering',
  'M.Tech in Mechatronics'
];

const seedStudents = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let globalCount = 1;

    for (const dept of departments) {
      console.log(`\nSeeding 10 students for ${dept}...`);
      
      for (let i = 1; i <= 10; i++) {
        const email = `teststudent${globalCount}@mite.ac.in`;
        // generate a unique 3 digit suffix for usn
        const usnSuffix = String(globalCount + 200).padStart(3, '0');
        const usnNumber = `4MT21XX${usnSuffix}`;
        const password = 'Password123!';
        const fullName = `Test Student ${globalCount}`;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
          // Create user
          user = await User.create({
            fullName,
            email,
            usnNumber,
            department: dept,
            yearOfStudy: 'Final Year',
            password, 
            role: 'student',
            isVerified: true, // Manually verify them so they can log in
          });
          
          // Create empty profile
          await StudentProfile.create({
            userId: user._id,
          });
          console.log(`Created: ${email}`);
        } else {
          console.log(`User ${email} already exists, skipping...`);
        }
        
        globalCount++;
      }
    }

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding students:', error);
    process.exit(1);
  }
};

seedStudents();
