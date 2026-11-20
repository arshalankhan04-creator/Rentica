const mongoose = require('mongoose');

const SOURCE_URI = 'mongodb://localhost:27017/rentica';
const TARGET_URI = 'mongodb://localhost:27017/rentica';

const migrateDatabase = async () => {
  try {
    console.log(`Connecting to source database: ${SOURCE_URI}...`);
    const sourceConn = await mongoose.createConnection(SOURCE_URI).asPromise();
    console.log('Source database connected.');

    console.log(`Connecting to target database: ${TARGET_URI}...`);
    const targetConn = await mongoose.createConnection(TARGET_URI).asPromise();
    console.log('Target database connected.');

    const collections = await sourceConn.db.listCollections().toArray();
    console.log(`Found ${collections.length} collection(s) in source database:`, collections.map(c => c.name));

    for (const col of collections) {
      const colName = col.name;
      if (colName.startsWith('system.')) continue;

      console.log(`Migrating collection: ${colName}...`);
      const documents = await sourceConn.db.collection(colName).find({}).toArray();
      console.log(`Found ${documents.length} document(s) in ${colName}.`);

      if (documents.length > 0) {
        // Drop existing target collection if present to avoid duplication
        try {
          await targetConn.db.collection(colName).drop();
        } catch (err) {
          // Ignore error if collection does not exist
        }
        await targetConn.db.collection(colName).insertMany(documents);
        console.log(`Successfully migrated ${documents.length} document(s) to target '${colName}'.`);
      } else {
        // Create empty collection in target DB if source has 0 docs
        await targetConn.createCollection(colName);
        console.log(`Created empty collection '${colName}' in target database.`);
      }
    }

    console.log('\nMigration complete! The database rentica is now populated and ready in MongoDB.');
    await sourceConn.close();
    await targetConn.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateDatabase();

