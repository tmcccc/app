const Review= require ('./../modeles/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppErr = require ('./../utils/appErr')
const fuctory = require ('./fuctoryController')



 exports.getAllReviews = catchAsync( async(req,res,next)=>{

        const filter = {}
        if(req.params.tourID) filter.tour=req.params.tourID      ///wiil get all reviews for a cuurnt tour= meaning if route the was api/v1/tour/387844/reviw then the tourid is 387844- we used nested routs// the other option is that we used api/v1/revie in this case we will get all revies of all toours

        const reviews = await Review.find(filter);

        res.status(200).send({
            status: "success",
            result: reviews.length,
             data: {
            allReviews:reviews
            }
        })

})

//for creating a new review -we need to hace a user and a tour for each review
exports.setUserIdTourId =  catchAsync( async (req,res,next) => {

    if(!req.body.user) req.body.user= req.user._id;           
    if(!req.body.tour) req.body.tour=req.params.tourID;         //we check in this case if  it cam from tour - api/v1/tour/387844/reviw the ither option is  api/v1/review in thi case we need to define in the req.body the userid and the tour id 
                                                                // this we can do beacuse we have a nested route and we defined the review router with {mergeParams:true} so params.tourid comes from tour route

    next();

   
})

exports.newReview =fuctory.createOne(Review)
exports.deleteReview = fuctory.deleteOne(Review)
exports.updateReview = fuctory.updateOne(Review)
