const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const Category = require("../models/categoryModel");

exports.getAllCategories = asyncErrorHandler(async (req, res, next) => {
    try {
        const categories = await Category.find();

        res.status(200).json({
            categories
        })
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({
            error
        })
    }


})


exports.getCategoryBlogs = asyncErrorHandler(async (req, res, next) => {

    const resultPerPage = 6;

    try {

        const data = await Category.findById(req.params.id).populate("blogs");

        let total = Math.floor(data.blogs.length / resultPerPage);
        let currentPage = req.params.page || 1;
        let skipBlogs = resultPerPage * (currentPage - 1);

        const blogs = await Category.findById(req.params.id).populate('blogs').limit(resultPerPage).skip(skipBlogs);

        res.status(200).json({
            blogs: blogs.blogs,
            pages: total
        })
    } catch (error) {
        console.log(error)
        console.log('Error: ', error);
        res.status(500).json({
            error
        })
    }
})


exports.createCategory = asyncErrorHandler(async (req, res, next) => {

    let { name } = req.body

    try {
        const category = await Category.create({ name });

        res.status(200).json({
            category
        })
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({
            error
        })
    }


})

exports.deleteCategory = asyncErrorHandler(async (req, res, next) => {

    let { id } = req.params

    Category.findByIdAndRemove(id)
        .then(function () {
            res.status(200).json({
                message: 'Deleted the category'
            })
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send('Error: ' + err);
        });

})

exports.addBlogToCategory = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const blogId = req.body.id;

    console.log('params: ', req.params);

    try {
        let category = await Category.findById(id);
        console.log('Category: ', category);
        let blogs = category.blogs
        blogs.push(blogId)
        category.blogs = blogs
        await category.save();

        res.status(200).json({
            category: category,
            message: 'Blog Added to Category!'
        })
    } catch (error) {
        console.log('Error Blog: ', error);
        res.status(500).json({
            error,
            message: 'Error While adding Blog to Category'
        })
    }



})



exports.removeBlogFromCategory = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const blogId = req.body.id;

    console.log('category(id): ', id);
    console.log('Blog(id): ', blogId);

    try {
        let category = await Category.findById(id);
        console.log('category: ', category);
        let blogs = category.blogs
        // console.log('Blogs: ', blogs);
        blogs = blogs.filter((e) => {
            if (e.valueOf() !== blogId) {
                return e
            }
        })
        // console.log('Blogs after Filter: ', blogs);
        category.blogs = blogs
        await category.save();

        console.log('category: ', category);
        res.status(200).json({
            category: category,
            message: 'Blog removed from Category!'
        })
    } catch (error) {
        res.status(500).json({
            error,
            message: 'Error While removing Blog from Category'
        })
    }



})