const express = require('express');
const router = express.Router();


//routes

//middlewares
const authVerifyMiddleware = require('../middlewares/authMiddleware');

//routes
const authRoute = require('../modules/Auth/controller');
const SeatBesideHostRoutes = require('../modules/SeatBesideHost/route');
const userRoute=require('../modules/User/controller');
const agencyRoute = require('../modules/Agency/controller');
const hostRoute = require('../modules/Host/controller');
const feedRoute= require('../modules/Feeds/controller');
const adminRoute = require('../modules/Admin/controller');
const beanRoute = require('../modules/Bean/controller');
const resellerRoute = require('../modules/Reseller/controller');
const SkinRoute = require('../modules/Skin/route');
const BannerRoute = require('../modules/Banner/route');
const LevelRoute = require('../modules/Level/controller');
const LiveRoomRoute = require('../modules/LiveRoom/route');

    



//EndPoint
router.use('/auth', authRoute);
router.use('/user',userRoute);
router.use('/agency',agencyRoute);
router.use('/host',hostRoute);
router.use('/feed',feedRoute);
router.use('/admin',adminRoute);
router.use('/bean',beanRoute);
router.use('/reseller',resellerRoute);
router.use('/skin',SkinRoute);
router.use('/seat-beside-host',SeatBesideHostRoutes);
router.use('/banner', BannerRoute);
router.use('/level', LevelRoute)
router.use('/live-room', LiveRoomRoute)
// router.use(authVerifyMiddleware);

module.exports = router;