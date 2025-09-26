require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskify';

async function seed() {
  await connectDB(MONGODB_URI);

  await User.deleteMany({});
  await Task.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);
  const user = new User({ name: 'Test User', email: 'test@local', passwordHash });
  await user.save();

  const tasks = [
    { title: 'Finish README', description: 'Write README for the project', priority: 'HIGH', status: 'PENDING', createdBy: user._id },
    { title: 'Fix CSS bug', description: 'Resolve tailwind build issue', priority: 'MEDIUM', status: 'PENDING', createdBy: user._id },
    { title: 'Add pagination', description: 'Implement server-side pagination', priority: 'LOW', status: 'PENDING', createdBy: user._id }
  ];

  await Task.insertMany(tasks);

  console.log('Seed completed. Test user:', { email: user.email, password: 'password123' });
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
