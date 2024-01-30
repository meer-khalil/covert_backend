const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const Category = require("../models/category.model");

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
