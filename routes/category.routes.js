const express = require('express')

const CategoryController = require('../controllers/category.controller');

const router = express.Router();

router.route('/').get(CategoryController.getAllCategories);
router.route('/').post(CategoryController.createCategory);
router.route('/:id').delete(CategoryController.deleteCategory);

module.exports = router