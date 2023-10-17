const mongoose = require('mongoose');

const storeSchema = mongoose.Schema({
  vendor_id: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  business_email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      default: 'Point', // Set the type as 'Point'
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers for longitude and latitude
      required: true,
    },
  },
});

storeSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Store', storeSchema);
