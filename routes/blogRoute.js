const express = require("express");
const {
  getBlogs, getBlogDetails, createBlog, updateBlog, deleteBlog, getBlogsByCategory
} = require("../controllers/blogController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/admin/blog/new").post(isAuthenticatedUser, authorizeRoles('admin'), upload.fields([{ name: 'cover' }]), createBlog);
router.route("/blogs").get(getBlogs);
router.route("/blogs/tag/:tagId").get(getBlogsByCategory);
router.route("/blog/:id").get(getBlogDetails);

router.route('/admin/blog/:id')
  .put(isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'cover' }]), updateBlog)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBlog);

module.exports = router;
