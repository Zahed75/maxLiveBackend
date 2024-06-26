const express = require("express");
const multerMiddleware = require("../../middlewares/multerMiddlware");
const { createBannerHandler, getAllBannersHandler } = require("./controller");
const router = express.Router();


router.post('/update-banner',
    multerMiddleware.upload.fields([{ name: "newImages" }]),
    createBannerHandler);
router.get('/getAllBanners', getAllBannersHandler)
module.exports = router;