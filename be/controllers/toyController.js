const Toy = require('../models/Toys');
const s3Service = require('../services/s3Service');

exports.getAllToys = async (req, res, next) => {
  try {
    const { category, status, search, page = 1, limit = 12 } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;

    const toys = await Toy.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Toy.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Toys fetched successfully',
      data: toys,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedToys = async (req, res, next) => {
  try {
    const Inspection = require('../models/Inspection');
    const Booking = require('../models/Booking');

    const topBookings = await Inspection.aggregate([
      { $match: { type: 'pickup' } },
      { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'booking' } },
      { $unwind: '$booking' },
      { $group: { _id: '$booking.toyId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    if (topBookings.length > 0) {
      const toyIds = topBookings.map(b => b._id);
      const toys = await Toy.find({ _id: { $in: toyIds } });
      const sorted = toyIds.map(id => toys.find(t => t._id.equals(id))).filter(Boolean);
      return res.json({ success: true, data: sorted, message: 'Featured toys fetched' });
    }

    const toys = await Toy.find({ status: 'AVAILABLE' }).limit(6).sort({ createdAt: -1 });
    res.json({ success: true, data: toys, message: 'Featured toys fetched (latest)' });
  } catch (error) {
    next(error);
  }
};

exports.getPendingToys = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const toys = await Toy.find({ status: 'PENDING' }).limit(parseInt(limit)).sort({ createdAt: -1 });
    res.json({ success: true, data: toys, message: 'Pending toys fetched' });
  } catch (error) {
    next(error);
  }
};

exports.getToyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const toy = await Toy.findById(id);
    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    const Booking = require('../models/Booking');
    const currentBooking = await Booking.findOne({
      toyId: id,
      status: { $in: ['PENDING_APPROVED', 'WAITING_PAYMENT', 'APPROVED', 'ACTIVE'] }
    }).sort({ createdAt: -1 }).select('renterId status');

    res.status(200).json({
      success: true,
      message: 'Toy fetched successfully',
      data: {
        ...toy.toObject(),
        currentBooking
      }
    });
  } catch (error) {
    next(error);
  }
};

// exports.createToy = async (req, res, next) => {
//   try {
//     const {
//       title,
//       category,
//       thumbnail,
//       pricePerHour,
//       depositValue,
//       status,
//       description,
//       images,
//       specifications,
//       ageRange,
//       origin
//     } = req.body;

//     const toy = new Toy({
//       title,
//       category,
//       thumbnail,
//       pricePerHour,
//       depositValue,
//       status: status || 'AVAILABLE'
//     });

//     const savedToy = await toy.save();

//     const toyDetail = new ToyDetail({
//       toyId: savedToy._id,
//       description,
//       images: images || [],
//       specifications: specifications || {},
//       ageRange,
//       origin
//     });


//     await toyDetail.save();

//     res.status(201).json({
//       success: true,
//       message: 'Toy created successfully',
//       data: {
//         ...savedToy.toObject(),
//         detail: toyDetail
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };


exports.createToy = async (req, res, next) => {
  try {
    const {
      title,
      category,
      thumbnail,
      pricePerHour,
      depositValue,
      status,
      description,
      images,
      specifications,
      ageRange,
      origin
    } = req.body;

    const toy = new Toy({
      title,
      category,
      thumbnail,
      pricePerHour,
      depositValue,
      status: status || 'AVAILABLE',
      description,
      images: images || [],
      specifications: specifications || {},
      ageRange,
      origin
    });
    const savedToy = await toy.save();

    res.status(201).json({
      success: true,
      message: 'Toy created successfully',
      data: {
        ...savedToy.toObject()
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateToy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      thumbnail,
      pricePerHour,
      depositValue,
      status,
      description,
      images,
      specifications,
      ageRange,
      origin
    } = req.body;

    const oldToy = await Toy.findById(id);
    if (!oldToy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    if (oldToy.status === 'RENTED') {
      return res.status(400).json({
        success: false,
        message: 'Đồ chơi đang được thuê, không thể chỉnh sửa!'
      });
    }

    if (thumbnail && oldToy.thumbnail && thumbnail !== oldToy.thumbnail && oldToy.thumbnail.includes(process.env.AWS_S3_BUCKET_NAME)) {
      await s3Service.deleteFile(oldToy.thumbnail);
    }

    if (images && Array.isArray(images) && Array.isArray(oldToy.images)) {
      const removedImages = oldToy.images.filter(img => !images.includes(img) && img.includes(process.env.AWS_S3_BUCKET_NAME));
      for (const imgUrl of removedImages) {
        await s3Service.deleteFile(imgUrl);
      }
    }


    const toy = await Toy.findByIdAndUpdate(
      id,
      {
        title,
        category,
        thumbnail,
        pricePerHour,
        depositValue,
        status,
        description,
        images,
        specifications,
        ageRange,
        origin
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Toy updated successfully',
      data: {
        ...toy.toObject()
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteToy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const toy = await Toy.findById(id);
    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    if (toy.status === 'RENTED') {
      return res.status(400).json({
        success: false,
        message: 'Đồ chơi đang được thuê, không thể xóa!'
      });
    }

    if (toy.thumbnail && toy.thumbnail.includes(process.env.AWS_S3_BUCKET_NAME)) {
      await s3Service.deleteFile(toy.thumbnail);
    }
    if (toy && Array.isArray(toy.images)) {
      for (const imgUrl of toy.images) {
        if (imgUrl.includes(process.env.AWS_S3_BUCKET_NAME)) {
          await s3Service.deleteFile(imgUrl);
        }
      }
    }

    await Toy.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Toy deleted successfully',
      data: toy
    });
  } catch (error) {
    next(error);
  }
};

exports.updateToyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const toy = await Toy.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Toy status updated successfully',
      data: toy
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadToyImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const imageUrls = await s3Service.uploadMultipleFiles(req.files, 'toys');

    res.status(200).json({
      success: true,
      data: imageUrls,
      message: `${imageUrls.length} images uploaded successfully`
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Toy.distinct('category');
    res.status(200).json({
      success: true,
      data: categories,
      message: 'Categories fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};
