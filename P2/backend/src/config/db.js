const mongoose = require('mongoose');
const config = require('./index');

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('[DB] MongoDB connecté');
  } catch (err) {
    console.error('[DB] Échec de connexion MongoDB', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
