const express = require('express');
const router = express.Router();


//routes

//middlewares
const authVerifyMiddleware = require('../middlewares/authMiddleware');

//routes
const authRoute = require('../modules/Auth/controller');
const userRoute=require('../modules/User/controller');
const agencyRoute = require('../modules/Agency/controller');
const hostRoute = require('../modules/Host/controller');
const feedRoute= require('../modules/Feeds/controller');
const adminRoute = require('../modules/Admin/controller');
const beanRoute = require('../modules/Bean/controller');
const resellerRoute = require('../modules/Reseller/controller');
const SkinRoute = require('../modules/Skin/controller');

    



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
// router.use(authVerifyMiddleware);

module.exports = router;