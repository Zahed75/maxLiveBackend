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

const getUserProfileById = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    try {
      const user = await userService.getUserById(userId);
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const getAllUsersHandler = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json({ users });
  });


  const 

  const saveUserHandler = asyncHandler(async(req,res)=>{

    const user = await userService.saveUserService(req.body);
    res.status(200).json({
        message: "User added successfully!",
        user
    })
  
  })



router.post('/resetPass',resetPasswordHandler);
router.get('/usersById/:userId', getUserProfileById);
router.get('/allUsers', getAllUsersHandler);
router.post('/saveUser',saveUserHandler);

module.exports = router;
