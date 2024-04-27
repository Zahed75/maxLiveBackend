const express = require('express');
const router = express.Router();
const firebase = require('../../utility/maxlive-c8947-firebase-adminsdk-cnvfh-9e931f15cc.json');
const userService=require('../User/service');

const {
  brandManagerValidate,
  changeUserDetailsValidate,
  changePasswordValidate,
} = require('./request');

const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const handleValidation = require('../../middlewares/schemaValidation');
const { asyncHandler } = require('../../utility/common');
const { HEAD_OFFICE,BRANCH_ADMIN } = require('../../config/constants');




const resetPasswordHandler = asyncHandler(async(req,res)=>{

    const { email, newPassword } = req.body;
   
        const response = await userService.resetPassword(email, newPassword);
        res.status(200).json({
            message:"Successfully reset password",
            response
        });
   
})



// getAllUsers

const getUserProfileById = async (req, res) => {
    const userId = req.params.userId;
    try {
      const user = await userService.getUserById(userId);
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };







router.post('/resetPass',resetPasswordHandler);
router.get('/allUsers/:userId', getUserProfileById);

module.exports = router;
