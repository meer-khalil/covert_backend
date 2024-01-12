const Page = require("../models/pageModel");
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");

exports.getHomeData = asyncErrorHandler(async (req, res, next) => {
  const home = await Page.findOne({ name: "home" });

  console.log('home: ', home);
  let pageData = home.data

  res.status(200).json({
    ...pageData,
  });
});

exports.updatePageData = asyncErrorHandler(async (req, res, next) => {
  try {

    let page = await Page.find({ name: req.params.id });

    if (!page || page.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    console.log("Initial: ", page[0]._id);
    console.log("body: ", req.body);

    page = await Page.findByIdAndUpdate(page[0]._id, { data: req.body }, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    let pageData = page.data
    res.status(200).json({
      ...pageData,
    });
  } catch (error) {
    console.error("Error updating page:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

exports.getUpgradeData = asyncErrorHandler(async (req, res, next) => {
  const upgrade = await Page.findOne({ name: "upgrade" });

  let pageData = upgrade.data

  res.status(200).json({
    ...pageData,
  });
});

exports.getAboutData = asyncErrorHandler(async (req, res, next) => {
  const about = await Page.findOne({ name: "about" });

  let pageData = about.data

  res.status(200).json({
    ...pageData,
  });
});
