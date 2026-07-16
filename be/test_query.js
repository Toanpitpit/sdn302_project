const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/toy_rental_db').then(async () => {
  const Booking = require('./models/Booking');
  const matchQuery = { startDate: {} };
  matchQuery.startDate.$gte = new Date('2026-03-26T00:00:00+07:00');
  matchQuery.startDate.$lte = new Date('2026-03-26T23:59:59.999+07:00');
  console.log('Query:', matchQuery);
  const pipeline = [
    { $match: matchQuery },
    { $addFields: { toyIdObj: { $toObjectId: '$toyId' }, renterIdObj: { $toObjectId: '$renterId' } } }
  ];
  const b = await Booking.aggregate(pipeline);
  console.log('Result:', b.length);
  process.exit(0);
}).catch(console.error);
