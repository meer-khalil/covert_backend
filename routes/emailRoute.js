const express = require('express');
const { storeEmail, getEmails } = require('../controllers/emailController');

const router = express.Router();


router.route('/email').post(storeEmail);
router.route('/admin/email').get(getEmails);


module.exports = router;