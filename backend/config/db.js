const mongoose = require('mongoose');

// Increase default startup/download timeout for MongoMemoryServer
process.env.MONGOMS_START_TIMEOUT = '180000'; // 3 minutes

let mongodInstance = global._mongodInstance || null;

const startMemoryServer = async () => {
  if (global._mongodInstance) {
    try {
      return global._mongodInstance.getUri();
    } catch (_) {}
  }
  const { MongoMemoryServer } = require('mongodb-memory-server');
  mongodInstance = await MongoMemoryServer.create({
    instance: {
      dbName: 'wearandgo',
    },
    spawn: {
      timeout: 180000,
    },
  });
  global._mongodInstance = mongodInstance;

  const uri = mongodInstance.getUri();
  console.log(`✅ Embedded MongoMemoryServer active at: ${uri}`);
  return uri;
};

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log('⏳ Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(mongoUri, {
        dbName: 'wearandgo',
        serverSelectionTimeoutMS: 5000, // 5s timeout so startup doesn't lag if IP blocked
        socketTimeoutMS: 45000,
      });

      console.log(` MongoDB Connected: ${conn.connection.host} [DB: ${conn.connection.name}]`);
      return conn;
    } catch (atlasErr) {
      console.warn(`⚠️ Atlas connection failed (${atlasErr.message}).`);
      console.log('💡 Note: If IP is not whitelisted in Atlas, falling back to embedded database seamlessly.');
    }
  }

  // Fallback to embedded MongoMemoryServer
  try {
    console.log('🔄 Initializing robust local embedded MongoDB...');
    const localUri = await startMemoryServer();
    const conn = await mongoose.connect(localUri, {
      dbName: 'wearandgo',
    });
    console.log(` MongoDB Connected (Embedded): ${conn.connection.host} [DB: ${conn.connection.name}]`);
    return conn;
  } catch (memErr) {
    console.error(`❌ Embedded MongoDB error: ${memErr.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
