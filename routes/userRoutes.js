const express = require('express');

const router =express.Router();

const user = require('./../controllers/userController')
const authController = require('./../controllers/authController')


console.log("userrrrr");

// all of this routs they deal with autnticatin/ athorization -- they use the jwt or  diffrent token or there is  a check of the password- si we implimented the function handles in authcontrooler
router.route('/signup').post(authController.signUp)
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword)
router.route('/updatePassword').patch(authController.protected,authController.updatePassword)




//this routs of for the user itself
///the protected is written inside the autcontroller becuse its deals with the athetication it check if the jwt is a good on and if the user that we get from the jwt exsist
//meaning we deal with atuntication
//the update doesnt do any check for authetication or a passwod check thats why its written in the usercontrooler
router.route('/updateMe').patch(authController.protected, user.updateMe)     
router.route('/deleteMe').delete(authController.protected,user.deleteMe)  


///this routs for the adnminstator 

router.route('/')
.get(user.getAllUsers)
.post(user.newUser);

router.route('/:id')
.patch(user.updateUser)
.get(user.getUser)
.delete(user.deleteUser)




module.exports =router;
