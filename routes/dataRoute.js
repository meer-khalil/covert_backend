const express = require('express');
const { getZipData, getAllZipcodes } = require('../controllers/dataController');


const router = express.Router();

router.route('/zipcodes').get(getAllZipcodes);
router.route('/zipcode/:zipcode').get(getZipData);

module.exports = router