require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/user.model');

// Usage: node scripts/makeAdmin.js <email>
async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/makeAdmin.js <email>');
    process.exit(1);
  }
  await connectDB();
  const result = await User.updateOne({ email: email.toLowerCase() }, { isAdmin: true });
  console.log(result.matchedCount ? `${email} is now an admin.` : `No user found with email ${email}.`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
