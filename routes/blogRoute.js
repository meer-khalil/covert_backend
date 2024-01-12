const express = require("express");
const {
  getBlogs, getBlogDetails, createBlog, updateBlog, deleteBlog
} = require("../controllers/blogController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/admin/blog/new").post(isAuthenticatedUser, authorizeRoles('admin'), upload.fields([{ name: 'cover' }]), createBlog);
router.route("/blogs").get(getBlogs);
router.route("/blog/:id").get(getBlogDetails);

router.route('/admin/blog/:id')
  .put(isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'cover' }]), updateBlog)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBlog);

// router.route("/blog/new").post(isAuthenticatedUser, newOrder);
// router.route("/orders/me").get(isAuthenticatedUser, myOrders);

// router
//   .route("/admin/orders")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

// router
//   .route("/admin/order/:id")
//   .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
//   .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
