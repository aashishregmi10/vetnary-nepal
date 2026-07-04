const mongoose = require('mongoose');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[db] connected to MongoDB');
}

mongoose.connection.on('error', (err) => {
  console.error('[db] connection error', err);
});

module.exports = { connectDB };
