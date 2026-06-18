const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/toy_rental_db';

const filesToSeed = [
  { file: 'users.json', collection: 'users' },
  { file: 'toys.json', collection: 'toys' },
  { file: 'bookings.json', collection: 'bookings' },
  { file: 'inspections.json', collection: 'inspections' },
  { file: 'transactions.json', collection: 'transactions' },
  { file: 'toyDetails.json', collection: 'toydetails' }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    for (const item of filesToSeed) {
      const filePath = path.join(__dirname, item.file);
      if (!fs.existsSync(filePath)) {
        console.log(`File ${item.file} not found. Skipping.`);
        continue;
      }

      console.log(`Seeding collection ${item.collection} from ${item.file}...`);
      const rawData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(rawData);

      // Merge toy details directly into toys collection during seeding
      if (item.collection === 'toys') {
        const detailsPath = path.join(__dirname, 'toyDetails.json');
        if (fs.existsSync(detailsPath)) {
          const detailsData = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));
          data.forEach(toy => {
            const detail = detailsData.find(d => d.toyId === toy._id);
            if (detail) {
              toy.description = detail.description || '';
              toy.images = detail.images || [];
              toy.specifications = detail.specifications || {};
              toy.ageRange = detail.ageRange || '';
              toy.origin = detail.origin || '';
            }
          });
        }
      }

      // Convert string _ids to ObjectID and dates where necessary
      const parsedData = data.map(doc => {
        const copy = { ...doc };
        if (copy._id && typeof copy._id === 'string' && copy._id.length === 24) {
          copy._id = new mongoose.Types.ObjectId(copy._id);
        }
        if (copy.ownerId && typeof copy.ownerId === 'string' && copy.ownerId.length === 24) {
          copy.ownerId = new mongoose.Types.ObjectId(copy.ownerId);
        }
        if (copy.renterId && typeof copy.renterId === 'string' && copy.renterId.length === 24) {
          copy.renterId = new mongoose.Types.ObjectId(copy.renterId);
        }
        if (copy.toyId && typeof copy.toyId === 'string' && copy.toyId.length === 24) {
          copy.toyId = new mongoose.Types.ObjectId(copy.toyId);
        }
        if (copy.bookingId && typeof copy.bookingId === 'string' && copy.bookingId.length === 24) {
          copy.bookingId = new mongoose.Types.ObjectId(copy.bookingId);
        }
        if (copy.userId && typeof copy.userId === 'string' && copy.userId.length === 24) {
          copy.userId = new mongoose.Types.ObjectId(copy.userId);
        }

        // Convert date strings
        if (copy.createdAt && typeof copy.createdAt === 'string') copy.createdAt = new Date(copy.createdAt);
        if (copy.updatedAt && typeof copy.updatedAt === 'string') copy.updatedAt = new Date(copy.updatedAt);
        if (copy.startDate && typeof copy.startDate === 'string') copy.startDate = new Date(copy.startDate);
        if (copy.endDate && typeof copy.endDate === 'string') copy.endDate = new Date(copy.endDate);

        return copy;
      });

      // Clear collection first
      await mongoose.connection.db.collection(item.collection).deleteMany({});
      
      // Insert new documents
      if (parsedData.length > 0) {
        await mongoose.connection.db.collection(item.collection).insertMany(parsedData);
        console.log(`Successfully seeded ${parsedData.length} documents into ${item.collection}.`);
      } else {
        console.log(`No documents found in ${item.file}.`);
      }
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
