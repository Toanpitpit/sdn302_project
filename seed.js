const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Định nghĩa schemas tạm cho việc import
const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const toySchema = new mongoose.Schema({}, { strict: false, collection: 'toys' });
const bookingSchema = new mongoose.Schema({}, { strict: false, collection: 'bookings' });
const transactionSchema = new mongoose.Schema({}, { strict: false, collection: 'transactions' });
const inspectionSchema = new mongoose.Schema({}, { strict: false, collection: 'inspections' });

const User = mongoose.model('UserSeed', userSchema);
const Toy = mongoose.model('ToySeed', toySchema);
const Booking = mongoose.model('BookingSeed', bookingSchema);
const Transaction = mongoose.model('TransactionSeed', transactionSchema);
const Inspection = mongoose.model('InspectionSeed', inspectionSchema);

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/toy_rental_db';

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('--- Đã kết nối thành công tới MongoDB ---');

        // 1. Đọc dữ liệu từ các file JSON
        const dbPath = path.join(__dirname, 'Db');
        const usersData = JSON.parse(fs.readFileSync(path.join(dbPath, 'users.json'), 'utf8'));
        const toysData = JSON.parse(fs.readFileSync(path.join(dbPath, 'toys.json'), 'utf8'));
        const bookingsData = JSON.parse(fs.readFileSync(path.join(dbPath, 'bookings.json'), 'utf8'));
        const transactionsData = JSON.parse(fs.readFileSync(path.join(dbPath, 'transactions.json'), 'utf8'));
        const inspectionsData = JSON.parse(fs.readFileSync(path.join(dbPath, 'inspections.json'), 'utf8'));

        // 2. Dọn dẹp cơ sở dữ liệu cũ
        console.log('Đang xóa dữ liệu cũ...');
        await Promise.all([
            User.deleteMany({}),
            Toy.deleteMany({}),
            Booking.deleteMany({}),
            Transaction.deleteMany({}),
            Inspection.deleteMany({})
        ]);

        // 3. Chèn dữ liệu mới
        console.log('Đang gieo dữ liệu mới (Seeding)...');
        await Promise.all([
            User.insertMany(usersData),
            Toy.insertMany(toysData),
            Booking.insertMany(bookingsData),
            Transaction.insertMany(transactionsData),
            Inspection.insertMany(inspectionsData)
        ]);

        console.log('--- Gieo dữ liệu thành công! ---');
        console.log(`- Đã chèn ${usersData.length} Users`);
        console.log(`- Đã chèn ${toysData.length} Toys`);
        console.log(`- Đã chèn ${bookingsData.length} Bookings`);
        console.log(`- Đã chèn ${transactionsData.length} Transactions`);
        console.log(`- Đã chèn ${inspectionsData.length} Inspections`);

    } catch (error) {
        console.error('Lỗi trong quá trình gieo dữ liệu:', error);
    } finally {
        await mongoose.disconnect();
        console.log('--- Đã ngắt kết nối database ---');
    }
}

seedDatabase();
