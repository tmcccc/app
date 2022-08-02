const mongoose = require('mongoose')

const reviewSchema =  new mongoose.Schema({

    review:{
        type:String,
        required:[true,"reviue cant be empty"]
    },


    rating:{
        type:Number,
        min:[1,"review rating must be greater or equal to one"],
        max:[5,"review rating must be less or equal to five"]

    },

    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },

    //we are doing parent referncing because mabe a touur can have alot of reviews so if we would hve did it child refrencuing ( like the users in  a tour document)
    //we canr have a huge array of reviews in a tour document and its not good because a huge suze of document is not good. in the other hand a tour doesnt have a lot of guides
    //maybe he got 3,4 so we can do it as we did it - child referncing
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,"a review must be on a tour"]
    },

    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,"a review must has a user"]

    }


},{
  toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

//we do it to querses also in tours and also in users
//in this case of path="tour"  wiil excute three quuris the first one is the query that retunrs the review, the second is the query that take the id of a doucumrnt of a tour
//from the review document (that we jsut query for hum) and does a qury to get the tour (tour.findbyid0) the id is the id in the document review. thrn another queety wull be make beacuse we also do 
///pupulate in the touemodel the query that will be made is on the user collection - ti find all the guides of the tour
reviewSchema.pre(/^find/,function (next){

     this.populate([//{
    //     path:"tour",
    //     select:"name duration ",
    // },
    {
        path:"user",
        select:"name photo"
    }])

    next()
}

)

const Review = mongoose.model('Review',reviewSchema);

module.exports =Review;