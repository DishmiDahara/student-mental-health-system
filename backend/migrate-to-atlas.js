const mongoose = require('mongoose');

const LOCAL_URI = process.env.LOCAL_MONGO_URI || 'mongodb://localhost:27017/mentalhealth';
const ATLAS_URI = process.argv[2];

if (!ATLAS_URI) {
  console.log('\n❌ Error: Please provide your MongoDB Atlas URI as an argument.');
  console.log('Usage: node backend/migrate-to-atlas.js "<YOUR_ATLAS_CONNECTION_STRING>"\n');
  process.exit(1);
}

async function migrate() {
  console.log('==============================================');
  console.log('🚀 Starting Local to Atlas Database Migration');
  console.log('==============================================\n');

  console.log('1. Connecting to Local MongoDB (localhost:27017)...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('   ✅ Connected to Local DB!');

  console.log('\n2. Connecting to MongoDB Atlas Cloud...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('   ✅ Connected to Atlas DB!');

  const collections = await localConn.db.listCollections().toArray();
  console.log(`\n3. Found ${collections.length} collection(s) in local 'mentalhealth' database.`);

  for (const col of collections) {
    const colName = col.name;
    if (colName.startsWith('system.')) continue;
    
    const docs = await localConn.db.collection(colName).find({}).toArray();
    console.log(`\n   📦 Migrating collection: '${colName}' (${docs.length} records)...`);
    
    if (docs.length > 0) {
      // Clean target collection in Atlas first to prevent duplicate key errors
      await atlasConn.db.collection(colName).deleteMany({});
      await atlasConn.db.collection(colName).insertMany(docs);
      console.log(`      ✅ Successfully transferred ${docs.length} records to Atlas!`);
    } else {
      console.log(`      ℹ️ Collection '${colName}' is empty, skipping transfer.`);
    }
  }

  console.log('\n==============================================');
  console.log('🎉 Migration Finished! All local accounts & data are now on Atlas.');
  console.log('==============================================\n');
  
  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
