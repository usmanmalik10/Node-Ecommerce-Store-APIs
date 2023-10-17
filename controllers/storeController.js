const Store = require('../models/storeModel');
const User = require('../models/userModel');

// Function to create a store
const createStore = async (req, res) => {
  try {
    // Check if the user (vendor) with the provided ID exists
    const userData = await User.findOne({ _id: req.body.vendor_id });
    if (userData) {
      // Check if latitude and longitude are provided
      if (!req.body.latitude || !req.body.longitude) {
        res.status(400).send({
          success: false,
          msg: 'Latitude and Longitude are required.',
        });
      } else {
        // Check if a store with the same vendor ID already exists
        const vendorData = await Store.findOne({
          vendor_id: req.body.vender_id,
        });

        if (vendorData) {
          res.status(200).send({
            success: false,
            msg: 'A store for this vendor already exists.',
          });
        } else {
          // Create a new store document
          const store = new Store({
            vendor_id: req.body.vendor_id,
            logo: req.file.filename,
            business_email: req.body.business_email,
            address: req.body.address,
            pin: req.body.pin,
            location: {
              type: 'Point',
              coordinates: [
                parseFloat(req.body.longitude),
                parseFloat(req.body.latitude),
              ],
            },
          });

          // Save the new store document to the database
          const storeData = await store.save();
          res.status(200).send({ success: true, data: storeData });
        }
      }
    } else {
      // If the vendor (user) does not exist
      res
        .status(200)
        .send({ success: false, msg: 'Vendor ID does not exist.' });
    }
  } catch (error) {
    console.error('An error occurred:', error); // Log the error to the console for debugging.
    res.status(400).send({ success: false, msg: 'An error occurred.' });
  }
};

module.exports = {
  createStore,
};
