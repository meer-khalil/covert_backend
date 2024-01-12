const express = require("express");
const {
  getHomeData,
  getUpgradeData,
  getAboutData,
  updatePageData,
} = require("../controllers/pageController");

const router = express.Router();

router.route("/pages/home").get(getHomeData);
router.route("/pages/upgrade").get(getUpgradeData);
router.route("/pages/about").get(getAboutData);

router.route("/pages/:id").put(updatePageData);

module.exports = router;