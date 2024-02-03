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
const getCityNameByZipcode = require('../utils/getCityByZipcode');
const State = require('../models/Data/stateModel');
const addStateToList = require('../utils/addStateToList');


// Get All Products
exports.getAllProperties = asyncErrorHandler(async (req, res, next) => {

    const resultPerPage = 4;

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
        properties,
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

// Get Product Details
exports.getPropertyDetails = asyncErrorHandler(async (req, res, next) => {

    const property = await Property.findOne({ slug: req.params.slug });

    if (!property) {
        return next(new ErrorHandler("Property Not Found", 404));
    }

    res.status(200).json(property);
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

    // add state name to database
    let zipcode = property.zipcode
    addStateToList(zipcode);

    const uploadedImages = req.files['images'];
    const uploadedFiles = req.files['files'];

    property.files = uploadedFiles
    property.images = uploadedImages
    property.user = req.user.id

    try {
        const propertyDoc = await Property.create(property);

        console.log(propertyDoc);

        res.status(201).json(propertyDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

// Update Property ---ADMIN
exports.updateProperty = asyncErrorHandler(async (req, res, next) => {

    let property = await Property.findOne({ slug: req.params.slug });

    if (!property) {
        return next(new ErrorHandler("Property Not Found", 404));
    }


    let propertyData = JSON.parse(req.body.property)
    console.log('data', propertyData);
    let { oldImages } = req.body;


    oldImages = oldImages?.map((item) => JSON.parse(item))

    let dImages = [];
    if (oldImages) {
        dImages = property?.images?.filter(e => {
            let del = true;
            for (let index = 0; index < oldImages?.length; index++) {
                const element = oldImages[index];
                if (element?._id == e._id) {
                    /**
                     * If you head cut by the sword then I think it is less painful and honorable
                     * But what you will say if your opponent kill you with needle
                     * More painful, More dishonorable
                     */
                    del = false
                    break;
                }
            }
            if (del) {
                return e;
            }
        })
    }

    const uploadedImages = req?.files?.images;
    if (uploadedImages) {
        propertyData.images = uploadedImages
    }

    if (oldImages) {
        if (!propertyData.hasOwnProperty('images')) {
            propertyData.images = []
        }
        oldImages.forEach((item) => {
            propertyData.images.push(item)
        })
    }

    if (dImages) {
        console.log('delete: ', dImages);
        deleteOldImages(dImages)
    }

    Property.findByIdAndUpdate(property._id, propertyData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })
        .then((property) => {
            // console.log('property: ', property);
            res.status(201).json(property)
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json(error);
        })
});

function deleteOldImages(images) {
    images.forEach((image) => {
        fs.unlink(image.path, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`Deleted file ${image.filename}`);
            }
        });
    });
}
exports.deleteOldImages = deleteOldImages

// Delete Product ---ADMIN
exports.deleteProperty = asyncErrorHandler(async (req, res, next) => {

    const property = await Property.findOne({ slug: req.params.slug });

    if (!property) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    // get the images
    let images = property.images;
    let files = property.files;

    // delete the images
    deleteOldImages(images);
    deleteOldImages(files);

    Property.deleteOne({ _id: property._id })
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
    let city = await getCityNameByZipcode(query);
    console.log("City: ", city);

    try {
        const response = await axios.get(
            `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&titles=${city}`
        );
        const data = response.data;
        console.log('Data: ', data);
        res.json({
            data,
            city
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error while fetching data from Wikipedia.');
    }
})


exports.getAllStates = asyncErrorHandler(async (req, res) => {
    try {
        // Fetch all states from the database
        let states = await State.find();

        res.json(states.map(e => e.name));
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})
