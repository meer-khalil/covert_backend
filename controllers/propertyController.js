const fs = require('fs');
const axios = require('axios');

// Components
const Contact = require('../models/contactModel');
const Review = require('../models/reviewsModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require('cloudinary');
const Property = require('../models/propertyModel');
const getState = require('../utils/getState');


// Get All Products
exports.getAllProperties = asyncErrorHandler(async (req, res, next) => {

    const resultPerPage = 12;
    const propertiesCount = await Property.countDocuments();


    const searchFeature = new SearchFeatures(
        Property.find(req.user.role === 'admin' ? {} : { published: true }),
        req.query
    )
        .search()
        .filter();

    let properties = await searchFeature.query;
    let filteredPropertiesCount = properties.length;

    searchFeature.pagination(resultPerPage);

    properties = await searchFeature.query.clone();

    res.status(200).json({
        success: true,
        properties,
        propertiesCount,
        resultPerPage,
        filteredPropertiesCount,
    });
});


exports.getProperties = asyncErrorHandler(async (req, res, next) => {

    const properties = await properties.find();

    res.status(200).json({
        success: true,
        products,
    });
});


// Get All Products ---Product Sliders
// exports.getPublishedProperties = asyncErrorHandler(async (req, res, next) => {

//     const properties = await Property.find({ published: true });

//     res.status(200).json({
//         success: true,
//         properties,
//     });
// });


// Get Product Details
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {

    const property = await Property.findById(req.params.id);
    // let reviews = await Review.find({ product: product._id })

    // console.log('\n\nProduct: ', product);
    // console.log('\n\nreviews: ', reviews);
    // console.log('Request Came');

    if (!property) {
        return next(new ErrorHandler("Property Not Found", 404));
    }

    // if (reviews) {
    //     product["reviews"] = reviews
    // }


    // console.log('\n\nProduct after adding reviews: \n', product);

    // let temp_product = {
    //     ...product,
    //     reviews
    // }
    // console.log('\n\nProduct after adding reviews: \n', temp_product);
    res.status(200).json({
        success: true,
        property
    });
});

// Get All Products ---ADMIN
exports.getAdminProperties = asyncErrorHandler(async (req, res, next) => {

    const products = await Property.find();

    res.status(200).json({
        success: true,
        products,
    });
});

// Create Product ---ADMIN
exports.createProperty = asyncErrorHandler(async (req, res, next) => {

    console.log('body: ', req.body);

    // let {
    //     title,
    //     description,
    //     price,
    //     actualCAP,
    //     proFormaCAP,
    //     occupancy,
    //     units,
    //     category,
    //     features,
    //     deleteImages,
    //     oldImages,
    //     showHome
    // } = req.body;


    const uploadedImages = req?.files?.images;

    console.log('Uploaded Images: ', uploadedImages);

    if (uploadedImages) {
        req.body.images = uploadedImages
    }

    req.body.user = req.user.id;

    try {

        const property = await Property.create(req.body);

        console.log('Property Created!');
        // console.log(property);

        // console.log('Inside Create Product Near to res');
        res.status(201).json({
            success: true,
            property
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Issue while creating property"
        });
    }
});


exports.createPropertyBySeller = asyncErrorHandler(async (req, res, next) => {

    const body = req.body
    let property = JSON.parse(body.property)

    const uploadedImages = req.files['images'];
    const uploadedFiles = req.files['files'];

    property.files = uploadedFiles
    property.images = uploadedImages
    property.user = req.user.id

    try {
        const propertyDoc = await Property.create(property);

        console.log(propertyDoc);

        res.status(201).json({
            success: true,
            property: propertyDoc
        });
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: "Issue while creating property"
        });
    }
});

// Update Property ---ADMIN
exports.updateProperty = asyncErrorHandler(async (req, res, next) => {


    let property = await Property.findById(req.params.id);

    if (!property) {
        return next(new ErrorHandler("Property Not Found", 404));
    }

    let {
        title,
        description,
        actualCAP,
        price,
        proFormaCAP,
        published,
        occupancy,
        units,
        category,
        features,
        deleteImages,
        oldImages,
        showHome
    } = req.body;


    let propertyData = {}


    const uploadedImages = req?.files?.images;

    // console.log('Uploaded Images: ', uploadedImages);

    if (uploadedImages) {
        propertyData.images = uploadedImages
    }

    if (oldImages) {
        if (!propertyData.hasOwnProperty('images')) {
            propertyData.images = []
        }
        oldImages.forEach((item) => {
            let image = JSON.parse(item)
            propertyData.images.push(image)
        })
    }

    if (deleteImages) {
        deleteImages = deleteImages.map((e) => JSON.parse(e))
        deleteOldImages(deleteImages)
    }



    propertyData = {
        ...propertyData,
        title,
        description,
        actualCAP,
        price,
        proFormaCAP,
        published,
        occupancy,
        units,
        category,
        features,
        showHome
    }

    property = await Property.findByIdAndUpdate(req.params.id, propertyData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if (property) {

        res.status(201).json({
            success: true,
            property
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Error While Updating"
        });
    }
});


function deleteOldImages(images) {
    images.forEach((image) => {
        fs.unlink(image.path, (err) => {
            if (err) {
                console.error(`Error deleting file ${image.filename}: ${err}`);
            } else {
                console.log(`Deleted file ${image.filename}`);
            }
        });
    });
}
exports.deleteOldImages = deleteOldImages

// Delete Product ---ADMIN
exports.deleteProperty = asyncErrorHandler(async (req, res, next) => {

    let params = req.params;
    console.log('Params: ', params);
    const property = await Property.findById(req.params.id);

    if (!property) {
        return next(new ErrorHandler("Product Not Found", 404));
    }


    // get the images
    let images = property.images;
    let files = property.files;

    // delete the images
    deleteOldImages(images);
    deleteOldImages(files);

    Property.deleteOne({ _id: req.params.id })
        .then(result => {
            if (result.deletedCount === 1) {
                res.status(201).json({
                    success: true
                });
            } else {
                res.status(500).json({
                    success: false
                });
            }
        })
        .catch(error => {
            console.error('Error deleting document:', error);
            res.status(500).json({
                success: true,
                message: error.message
            });
        });
});

// Create OR Update Reviews
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        product: req.body.productId,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }
    const isReviewed = await Review.countDocuments({ product: productId });

    // const isReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString());

    if (isReviewed) {

        const reviews = await Review.find({ product: productId, user: userId });
        reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating, rev.comment = comment);
        })
        // product.reviews.forEach((rev) => { 
        //     if (rev.user.toString() === req.user._id.toString())
        //         (rev.rating = rating, rev.comment = comment);
        // });
    } else {
        await Review.create(review);
        product.numOfReviews = await Review.countDocuments({ product: productId })
    }

    let avg = 0;

    const reviews = await Review.find({ product: productId })
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    });
});

// Get All Reviews of Product
exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {

    const reviews = await Review.find({ product: req.query.id });

    if (!reviews) {
        return next(new ErrorHandler("Reviews Not Found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: reviews
    });
});

// Get All Reviews of Product
exports.getHomeReviews = asyncErrorHandler(async (req, res, next) => {

    const reviews = await Review.find({ position: 'home' });

    if (!reviews) {
        return next(new ErrorHandler("Reviews Not Found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: reviews
    });
});
// Delete Reveiws
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {

    await Review.findByIdAndDelete(req.query.id)
    let reviews = await Review.find({ product: req.query.productId });

    if (!reviews) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    // reviews = reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        ratings: Number(ratings),
        numOfReviews,
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });


    res.status(200).json({
        success: true,
    });
});


// For Capturing Contact Info
// Create Product ---ADMIN
exports.createContact = asyncErrorHandler(async (req, res, next) => {

    // console.log('Working Contact\n', req.body);

    const data = {
        ...req.body
    }
    const contact = await Contact.create(data);

    // console.log('Created!');

    // console.log('Inside Create Product Near to res');
    res.status(201).json({
        success: true,
        contact
    });
});


exports.getWikiDetail = asyncErrorHandler(async (req, res, next) => {
    const { query } = req.query;

    console.log('Request Made: ', query);
    let state = getState(query).long;
    console.log("State: ", state);

    try {
        const response = await axios.get(
            `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&titles=${state}`
        );
        const data = response.data;
        // console.log('Data: ', data);
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error while fetching data from Wikipedia.');
    }
})