const express = require("express");
const multerMiddleware = require("../../middlewares/multerMiddlware");
const { createBannerHandler } = require("./controller");
const router = express.Router();


router.post('/update-banner',
    multerMiddleware.upload.fields([{ name: "newImages" }]),
    createBannerHandler);

module.exports = router;