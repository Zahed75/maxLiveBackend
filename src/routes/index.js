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
//EndPoint

router.use('/auth', authRoute);
router.use('/user',userRoute);
router.use('/agency',agencyRoute);
router.use('/host',hostRoute);
router.use(authVerifyMiddleware);

module.exports = router;