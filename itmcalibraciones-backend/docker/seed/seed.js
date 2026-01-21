const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/itm';
const DATA_DIR = path.join(__dirname, 'data');

// Helper to transform Extended JSON to native JS objects
function transformDoc(doc) {
  if (Array.isArray(doc)) {
    return doc.map(transformDoc);
  } else if (doc !== null && typeof doc === 'object') {
    if (doc.$oid) return new ObjectId(doc.$oid);
    if (doc.$date) return new Date(doc.$date);
    
    const newDoc = {};
    for (const key in doc) {
      if (key === '__v') continue; // Skip version key
      newDoc[key] = transformDoc(doc[key]);
    }
    return newDoc;
  }
  return doc;
}

async function seedCollection(db, collectionName, fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Skiping ${collectionName}: File not found`);
    return;
  }

  console.log(`📦 Seeding ${collectionName}...`);
  const rawData = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(rawData);
  const docs = transformDoc(jsonData);

  if (docs.length === 0) return;

  const collection = db.collection(collectionName);
  const count = await collection.countDocuments();
  
  if (count === 0) {
    try {
      await collection.insertMany(docs);
      console.log(`✅ Imported ${docs.length} documents into ${collectionName}`);
    } catch (e) {
      console.error(`❌ Error importing ${collectionName}:`, e.message);
    }
  } else {
    console.log(`⏭️ ${collectionName} already has data (${count} docs). Skipping.`);
  }
}

async function run() {
  let client;
  try {
    console.log('⏳ Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('🔗 Connected to MongoDB');

    const db = client.db();

    // Order matters if there are dependencies, but for these catalogs it's mostly fine.
    // brands and equipmenttypes are referenced by models, but MongoDB doesn't enforce FKs on insert usually.
    await seedCollection(db, 'states', 'states.json');
    await seedCollection(db, 'cities', 'cities.json');
    await seedCollection(db, 'brands', 'brands.json');
    await seedCollection(db, 'equipmenttypes', 'equipmenttypes.json');
    await seedCollection(db, 'models', 'models.json'); // References brands/types
    await seedCollection(db, 'users', 'users.json');
    await seedCollection(db, 'badgets', 'badgets.json');

    console.log('🏁 Seeding completed!');
  } catch (err) {
    console.error('🔥 Seed failed:', err);
  } finally {
    if (client) await client.close();
  }
}

// Simple retry logic for connectivity
const start = () => {
    run().catch(() => {
        console.log("Retrying in 5 seconds...");
        setTimeout(start, 5000);
    })
};

start();
