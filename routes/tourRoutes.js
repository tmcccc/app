const express = require("express");


const tour = require('./../controllers/tourController');
const authController = require('./../controllers//authController')
const router = express.Router();

const reviewRouter = require('./reviewRoutes')

console.log("willl run!!!!")

router.use('/ddddddddddd',(req,res,next)=>
{
    console.log("helo from tour")
    next();
})

//nested route
router.use('/:tourID/review', reviewRouter) 

router.get('/tours-stats',tour.getTourStat);
router.route('/tours-by-month/:year').get(tour.ToursByMonth);
//router.route('/tours-stats').get(tour.getTourStat);
router.route('/5-most-bestCheap').get(tour.fiveCheapes,tour.getAllTours)

router.route('/')
        .get(authController.protected,tour.getAllTours)
        .post(tour.newTour);

router.route('/:id/:id1?')
.patch(tour.updateTour)
.get(tour.getTour)
.delete(authController.protected,
        authController.restrictTo('admin','lead-guide'),
         tour.deleteTour); //this are the function handlers they are the last middellware beacuse they dont do next, the return respond to server!!!!

 



module.exports = router;