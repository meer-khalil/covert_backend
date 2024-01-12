const asyncErrorHandler = require("../middlewares/asyncErrorHandler");

const ZipCode = require('../models/Data/zipcodeModel');

// exports.createState = asyncErrorHandler(async (req, res) => {
//     try {
//         const state = new State({ name: req.body.state });
//         await state.save();
//         res.json(state);
//     } catch (error) {
//         res.status(500).json({ error: 'Unable to create state' });
//     }
// });

exports.getZipData = asyncErrorHandler(async (req, res) => {
  const requestedZipCode = req.params.zipcode;
  const query = req.query
  console.log('Here is the query: ', query);

  console.log('Requested ZipCode: ', requestedZipCode);
  
  try {

    const zipCodeData = await ZipCode.findOne({ zipcode: requestedZipCode });

    if (!zipCodeData) {
      return res.status(404).json({ error: 'Zip code not found' });
    }

    if (zipCodeData) {
      console.log('Here is data: ', zipCodeData);
      if (query.category) {
        console.log('Half Return');
        res.status(200).json(zipCodeData[query.category]);
      } else {
        console.log('Full Return');
        res.status(200).json(zipCodeData);
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving data' });
  }
});


exports.getAllZipcodes = asyncErrorHandler(async (req, res) => {
  try {
    const allZipCodes = await ZipCode.find({}, 'zipcode');

    if (!allZipCodes) {
      return res.status(404).json({ error: 'No zip codes found' });
    }

    const zipCodesList = allZipCodes.map((zipcode) => zipcode.zipcode);

    res.status(200).json(zipCodesList);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving data' });
  }
});