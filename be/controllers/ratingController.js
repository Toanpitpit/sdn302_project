const Rating = require('../models/Rating');
const Booking = require('../models/Booking');

exports.createRating = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { stars, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.renterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }

    if (booking.status !== 'COMPLETE') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    const existingRating = await Rating.findOne({ rentalId: bookingId });
    if (existingRating) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    const rating = await Rating.create({
      rentalId: bookingId,
      fromUserId: req.user._id,
      targetId: booking.toyId,
      targetModel: 'Toy',
      stars,
      comment
    });

    res.status(201).json({ success: true, data: rating, message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getToyRatings = async (req, res) => {
  try {
    const { id } = req.params; // toyId

    const ratings = await Rating.find({ targetId: id, targetModel: 'Toy' })
      .populate('fromUserId', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: ratings });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
