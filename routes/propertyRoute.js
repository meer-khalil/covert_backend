const express = require("express");

const {
  getProductDetails,
  getProductReviews,
  deleteReview,
  createProductReview,
  getHomeReviews,
  createContact,
  getAllProperties,
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getAdminProperties,
  createPropertyBySeller,
  getWikiDetail,
} = require("../controllers/propertyController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const upload = require('../middlewares/upload')
const router = express.Router();

router.route("/properties").get(isAuthenticatedUser, getAllProperties);
router.route("/properties/all").get(getProperties);

router.route('/seller/properties/new').post(isAuthenticatedUser, upload.fields([{ name: 'images' }, { name: 'files' }]), createPropertyBySeller)
router
  .route("/admin/properties")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProperties);
router
  .route("/admin/properties/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'images' }, { name: 'files' }]), createProperty);

router
  .route("/admin/properties/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'images' }]), updateProperty)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProperty);

// router
//   .route("/admin/properties/:id")
//   .put(isAuthenticatedUser, authorizeRoles("admin"), updateProperty);

router.route('/properties/wikipedia').get(isAuthenticatedUser, getWikiDetail)
router.route("/properties/:id").get(getProductDetails);

// router.route('/review').put(isAuthenticatedUser, createProductReview);
// router.route('/review').get(getHomeReviews);
// router.route('/admin/reviews')
//     .get(getProductReviews)
//     .delete(isAuthenticatedUser, deleteReview);

// router.route('/contact').post(createContact);

module.exports = router;