const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const Blog = require("../models/blog.model");
const Category = require('../models/category.model');
const ErrorHandler = require("../utils/errorHandler");

const cloudinary = require("cloudinary");
const SearchFeatures = require("../utils/searchFeatures");
const { deleteOldImages } = require("./property.controller");
const { query } = require("express");


exports.createBlog = asyncErrorHandler(async (req, res, next) => {
  try {
    let body = JSON.parse(req.body.data);
    let user = req.user;

    console.log('body: ', body);

    body.cover = req.files['cover'][0]

    body.user = user.id;

    const blog = await Blog.create(body);
    console.log('blog(created): ', blog);
    res.status(201).json(blog);

  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

exports.getBlogDetails = asyncErrorHandler(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate("user")
    .populate("tags")

  console.log('blog: ', blog);

  if (!blog) {
    return res.status(404).json({ message: "Blog Not Found" })
  }

  res.status(200).json(blog);
});


// Get All Orders ---ADMIN
exports.getBlogs = asyncErrorHandler(async (req, res, next) => {

  const resultPerPage = 12;

  console.log('query: ', query);
  const searchFeature = new SearchFeatures(Blog.find({}).select({ "title": 1, slug: 1, "cover": 1 }).populate("tags"), req.query)
    .search()
    .filter();

  let blogs = await searchFeature.query;
  let filteredPropertiesCount = blogs.length;

  searchFeature.pagination(resultPerPage);

  blogs = await searchFeature.query.clone();

  res.status(200).json({
    success: true,
    blogs,
    resultPerPage,
    filteredPropertiesCount,
  });
});

exports.getBlogsByCategory = asyncErrorHandler(async (req, res, next) => {

  const resultPerPage = 12;
  let data = await Blog.find({ tags: req.params.tagId }).populate('tags')
  console.log(data);
  const searchFeature = new SearchFeatures(Blog.find({ tags: req.params.tagId }).populate('tags'), req.query)
    .search()
    .filter();

  let blogs = await searchFeature.query;
  let filteredPropertiesCount = blogs.length;

  searchFeature.pagination(resultPerPage);

  blogs = await searchFeature.query.clone();

  res.status(200).json({
    success: true,
    blogs,
    resultPerPage,
    filteredPropertiesCount,
  });
});
// Update Order Status ---ADMIN
exports.updateBlog = asyncErrorHandler(async (req, res, next) => {

  let blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) {
    return res.status(404).json({ message: "Blog Not Found(Bachayi)" });
  }

  let body = JSON.parse(req.body.data);

  let image = req?.files?.cover
  if (image) {
    body.cover = image[0]
    deleteOldImages([blog.cover])
  }

  Blog.findOneAndUpdate({ slug: req.params.slug }, body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
    .then((blog) => res.status(201).json(blog))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    })
});

// // Delete Order ---ADMIN
exports.deleteBlog = asyncErrorHandler(async (req, res, next) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug });
    console.log("Post:", post);
    if (post) {
      try {
        deleteOldImages([post.cover])
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
      const result = await Blog.deleteOne({ _id: post._id });
      if (result.acknowledged) {
        res.status(201).json({
          success: true,
          blog: post
        });
      }
    } else {
      return next(new ErrorHandler("Blog Not Found(Bachayi)", 404));
    }
  } catch (error) {
    return next(new ErrorHandler("Error While deleteing Blog", 404));
  }
});
