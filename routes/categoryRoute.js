const express = require('express')

const { getAllCategories, createCategory, deleteCategory, getCategoryBlogs, addBlogToCategory, removeBlogFromCategory } = require('../controllers/categoryController');

const router = express.Router();

router.route('/categories').get(getAllCategories);
router.route('/categories/:id').get(getCategoryBlogs);
router.route('/categories').post(createCategory);
router.route('/categories/:id').delete(deleteCategory);

router.route('/categories/addblog/:id').put(addBlogToCategory);
router.route('/categories/removeblog/:id').put(removeBlogFromCategory);

module.exports = router