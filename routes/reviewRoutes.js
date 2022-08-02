const express = require('express')
const authController = require('./../controllers/authController')
const reviewController = require('./../controllers/reviewController')


const router = express.Router({mergeParams:true});   //nested route

router.use(authController.protected);

router.route('/').get(reviewController.getAllReviews)
                 .post(authController.restrictTo('user'),reviewController.setUserIdTourId,reviewController.newReview)
                 
                 
//  router.route('/:id').delete(authController.protected,authController.restrictTo('admin','user'))                
router.route('/:id').delete(reviewController.deleteReview)
                    .patch(reviewController.updateReview)


module.exports= router;