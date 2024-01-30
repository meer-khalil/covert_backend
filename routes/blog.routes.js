const express = require("express");
const BlogController = require("../controllers/blog.controllers");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/admin/blog/new").post(isAuthenticatedUser, authorizeRoles('admin'), upload.fields([{ name: 'cover' }]), BlogController.createBlog);
router.route("/").get(BlogController.getBlogs);
router.route("/tag/:tagId").get(BlogController.getBlogsByCategory);
router.route("/:slug").get(BlogController.getBlogDetails);

router.route('/admin/blog/:slug')
  .put(isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'cover' }]), BlogController.updateBlog)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), BlogController.deleteBlog);

module.exports = router;
