const mongoose = require('mongoose');

// 1. Định nghĩa các Model (Dán lại Schema của bạn để script có thể hiểu cấu trúc)
const Toy = mongoose.model('Toy', new mongoose.Schema({
    title: String, category: String, thumbnail: String, 
    pricePerHour: Number, depositValue: Number, status: String
}, { timestamps: true }));

const ToyDetail = mongoose.model('ToyDetail', new mongoose.Schema({
    toyId: mongoose.Schema.Types.ObjectId,
    description: String, images: [String],
    specifications: Object, ageRange: String, origin: String
}, { timestamps: true }));

const ToyMerge = mongoose.model('ToyMerge', new mongoose.Schema({
    title: String, category: String, thumbnail: String,
    pricePerHour: Number, depositValue: Number, status: String,
    description: String, images: [String], specifications: Object,
    ageRange: String, origin: String
}, { timestamps: true }));

// 2. Cấu hình kết nối Database
const MONGODB_URI = 'mongodb://127.0.0.1:27017/toy_rental_db'; 

async function mergeCollections() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('--- Đã kết nối MongoDB ---');

        console.log('Đang bắt đầu quá trình hợp nhất dữ liệu...');

        // 3. Sử dụng Aggregation để gộp data
        const mergedData = await Toy.aggregate([
            {
                // Nối với bảng ToyDetail dựa trên _id của Toy và toyId của ToyDetail
                $lookup: {
                    from: 'toydetails', // Tên collection trong DB (thường là số nhiều, chữ thường)
                    localField: '_id',
                    foreignField: 'toyId',
                    as: 'details'
                }
            },
            {
                // Vì lookup trả về array, chúng ta bóc tách phần tử đầu tiên
                $unwind: {
                    path: '$details',
                    preserveNullAndEmptyArrays: true // Giữ lại Toy kể cả khi không có ToyDetail
                }
            },
            {
                // Định dạng lại các field để khớp với ToyMerge Schema
                $project: {
                    _id: 0, // Không lấy _id cũ của Toy để tránh trùng lặp nếu chạy lại
                    title: 1,
                    category: 1,
                    thumbnail: 1,
                    pricePerHour: 1,
                    depositValue: 1,
                    status: 1,
                    description: '$details.description',
                    images: '$details.images',
                    specifications: '$details.specifications',
                    ageRange: '$details.ageRange',
                    origin: '$details.origin',
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        if (mergedData.length === 0) {
            console.log('Không tìm thấy dữ liệu để hợp nhất.');
            return;
        }

        // 4. Xóa dữ liệu cũ ở bảng ToyMerge (nếu có) và chèn dữ liệu mới
        await ToyMerge.deleteMany({});
        await ToyMerge.insertMany(mergedData);

        console.log(`--- Thành công! Đã hợp nhất ${mergedData.length} bản ghi vào bảng ToyMerge ---`);

    } catch (error) {
        console.error('Lỗi khi hợp nhất dữ liệu:', error);
    } finally {
        await mongoose.disconnect();
        console.log('--- Đã ngắt kết nối ---');
    }
}

mergeCollections();