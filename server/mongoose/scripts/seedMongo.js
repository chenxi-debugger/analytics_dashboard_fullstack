import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration defaults
const DEFAULT_CONFIG = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/chenxilogs',
  dbName: 'chenxilogs',
  jsonFilePath: null,
  collectionName: null,
  model: null,
  dataKey: null,
  clearCollection: false,
  useMongoose: true,
};

// Seeds MongoDB with data from a JSON file
async function seedMongo(config) {
  const {
    mongoUri,
    dbName,
    jsonFilePath,
    collectionName,
    model,
    dataKey,
    clearCollection,
    useMongoose,
  } = { ...DEFAULT_CONFIG, ...config };

  // Validate inputs
  if (!jsonFilePath) throw new Error('JSON file path is required');
  if (useMongoose && !model) throw new Error('Mongoose model is required when useMongoose is true');
  if (!useMongoose && !collectionName) throw new Error('Collection name is required when useMongoose is false');

  // Load JSON data
  let data;
  try {
    const rawData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    if (dataKey) {
      data = dataKey.split('.').reduce((obj, key) => {
        if (!obj || !obj[key]) throw new Error(`Invalid data key: ${key}`);
        return obj[key];
      }, rawData);
    } else {
      data = rawData;
    }
  } catch (err) {
    throw new Error(`Failed to load or parse JSON: ${err.message}`);
  }

  if (useMongoose) {
    try {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      if (clearCollection) {
        await model.deleteMany({});
        console.log(`🗑️ Cleared ${model.modelName} collection`);
      }

      if (Array.isArray(data)) {
        const result = await model.insertMany(data, { ordered: false });
        console.log(`✅ Inserted ${result.length} items into ${model.modelName} collection`);
      } else {
        const result = await model.create(data);
        console.log(`✅ Inserted 1 item into ${model.modelName} collection`);
      }
    } catch (err) {
      console.error(`❌ Error inserting data into ${model?.modelName || 'unknown'}:`, err);
    } finally {
      await mongoose.connection.close();
    }
  } else {
    const client = new MongoClient(mongoUri);
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      if (clearCollection) {
        await collection.deleteMany({});
        console.log(`🗑️ Cleared ${collectionName} collection`);
      }

      if (Array.isArray(data)) {
        const result = await collection.insertMany(data);
        console.log(`✅ Inserted ${result.insertedCount} items into ${collectionName} collection`);
      } else {
        const result = await collection.insertOne(data);
        console.log(`✅ Inserted 1 item into ${collectionName} collection`);
      }
    } catch (err) {
      console.error(`❌ Error inserting data into ${collectionName}:`, err);
    } finally {
      await client.close();
    }
  }
}

// Seed the five JSON files
async function main() {
  try {
    // Seed analyticsPageData.json (MongoClient)
    await seedMongo({
      jsonFilePath: path.join(__dirname, '../../data/analyticsPageData.json'),
      collectionName: 'analyticsPageData',
      dataKey: null,
      clearCollection: true,
      useMongoose: false,
    });

    // Seed ecommercePageData.json (MongoClient)
    await seedMongo({
      jsonFilePath: path.join(__dirname, '../../data/ecommercePageData.json'),
      collectionName: 'ecommercePageData',
      dataKey: null,
      clearCollection: true,
      useMongoose: false,
    });

    // Seed crmPageData.json (MongoClient)
    await seedMongo({
      jsonFilePath: path.join(__dirname, '../../data/crmPageData.json'),
      collectionName: 'crmPageData',
      dataKey: null,
      clearCollection: true,
      useMongoose: false,
    });

    // Seed email.json (MongoClient)
    await seedMongo({
      jsonFilePath: path.join(__dirname, '../../data/email.json'),
      collectionName: 'emailData',
      dataKey: null,
      clearCollection: true,
      useMongoose: false,
    });

    // Seed chat-data.json (MongoClient)
    await seedMongo({
      jsonFilePath: path.join(__dirname, '../../data/chat-data.json'),
      collectionName: 'chatData',
      dataKey: null,
      clearCollection: true,
      useMongoose: false,
    });

    console.log('✅ All seeding tasks completed.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

main();