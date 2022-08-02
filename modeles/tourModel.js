//document ,collections, module schema!!!!!!!!!!!!!!!!!!!!! this i need to remember

const mongoose = require('mongoose')
const validator = require('validator');
//const user = require('./userModel')

const toursSchema = new mongoose.Schema({            //describes how a document will look like
    name:{
        type:String,
        required:[true,'tour must have aname'],
        unique:true,
        trim:true,
        maxlength:[40,"tour name cant be more then 40 chars"],
        minlength:[4,"tour name cant be less then 4 chars"],
        //validate:[validator.isAlpha,"not goooooood"]
    },

    preSaveHook: String,

    duration:{
        type:Number,
        required:[true,'tour must have a validation']
    },

    maxGroupSize:{
        type:Number,
        required:[true,'tour must have a group size']
    },
    
    difficulty:{
        type:String,
        required:[true,'must have a difficulty'],
        enum:{
            values:["easy","medium","difficult"],
            message:"value isnot good"

        }
    },
    ratingAvrage:{
        type:Number,
        default:4.5,
        min:[1,"rating cant be lower then 1"],
        max:[5,"rating cant be higher then 5"]
    },

    ratingQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'a tour must have a price']
    },

    priceDiscount:{
                type:Number,
                validate:{
                validator: function(val){            ///woeks only in creating new documents douesnt work on update
                    
                    return val<this.price         ///this. is the dicument 
                },

                message:"not good discount"
            }
    },

    summary:{
        type:String,
        trim:true,
        required: [true,'a tour must have a summary']
    },

    description :{
        type:String,
        trim:true
    },

    imageCover:{
        type:String,
        required:[true,'a tour must have a image cove']
    },
    images : [String],

    createdAt :{
        type:Date,
        default:Date.now(),
        select:false
    },

    startDates: [Date],
    
    secretTour: {
      type: Boolean,
      default: false
    },

    startLocation:{

        type:{
            type:String,
            default:"Point",
            enum:["Point"]
        },

        coordinates: [Number],
        description:String,
        day:Number

    },
    //embedde modelling
    //here we create a embedde documnt of location insuide a tour -- meaning in a tour document we will have  few location documents
    //in order to get an id for  location document we need to create a array of object / when we crate 
    //a array of object so autmatcly mongoose gives every object inside the array an _id!!  _id is somethin that every document in mongose has - so in other words mongose rcgonize the 
    //objects inside the array a documens!!!!
    //if we creat just a array like:
    /*
       guides:[ 
        {
           
                type:String,
                default:"mouse"
        }
    ]
    we just get an regulur  array of values  in this exmple we create an array that can contain ony string and the defualt value is mouse it like doing   guides:[String] but 
    //beacuse we wanted to set it also with another propery we wrotr it like that 
    //if we wnated to it by refernce we will need to create another collection.model of location and save in the cokkection tour a ref to the location of the current tour
    */  
    locations : [{

        type:{
            type:String,
            default:"Point",
            enum:["Point"]
        },
        coordinates: [Number],
        description:String,
        day:Number
    }],

    //refernce modeliing 
    //regular array instead of the type beeing Number Or String the type is mongoose.Schema.ObjectId
    guides:[ 
        
        {
            type:mongoose.Schema.ObjectId ,  
            ref:"User"
        }
    ],


    sssssss:[ 
        
        {
            type:mongoose.Schema.ObjectId ,  
            ref:"User"
        }
    ],

    
},{
    toObject: { virtuals: true},
    toJSON: { virtuals: true }
})

//weekduration isnt a field that is saved in the db like that we save space
//this function will called only when we get a documnet from the collection 
toursSchema.virtual("weekDuration").get(function(){
    return this.duration/7;
})



//in the collection tour we  have field named  guides, that repesnets child refencing 
//we can also make a field named reviews to repersent child referncing - meaning an array that will hold the object ids of the reviews of the tour
//but this woudnt be good because a tour may have tons of reviews (and also we did parent rreferncing). so the solution is virtual populate 
//meaning we will have an array named reviews but it woudnt be like the array guides that is saved in every document in the tour collection 
//when we will do populate to the reviw field so a query will run in the rview collection bringing all the reviews with the tour id that we putted in the local id field
//then beacuse every review document has field of tour and user and they contain object id of a tour and a user and
//beccause that we defind a populate in review for to of them then anpther to query will run one to bring the tour and one to bring the user
// Virtual populate
toursSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'tour'
    
  });

 
//runs only before doing save() or create() -- save or create they rtuen a promise not like find that returns a query
toursSchema.pre('save', function(next) {
    console.log(this);              //this is the document before its saved to the db
    this.preSaveHook= "ddddddd";  
    next();
  });

  //this makes the user documnts embedded inside the tour document but in this case this isnt a goood way
  //to connect between tours and users. it better that the relation between to of them will be refernced
  //the reson for that is that they are not data realrd and akso we have akready a colection of users and a collection of tours when we do  a embded then we have one collection like 
  //what we did with locations . location doesnt have a collection
  //also the realtion between to of them is many to many beacuse a user (guide) can have a few tours and a tour can have a few guides. manr to many we use refernce!!
  //and akso the main reason when we update a user lets say change is email then we wikk need to go over all of are tourss and check if this user 
  //is a guide on one of the tours and update the email also in the tour document but if the rewaltion between to of them was reffernce so we woudnt need to go over
  //the tours and update them
  //the only good thin in embedde is that if we query the tour document and then we want to access the guides of this tour we dont need
  //to do another query because they are already saved in the  tour ducumnt in the array gudies
  //the problem here is that it only works also when creting new document and not when updatin a document
  /*
  toursSchema.pre('save', async function(next){

     const guidesPromises = this.guides.map( id=> user.findById(id).exec())
     this.guides = await  Promise.all(guidesPromises)

    next()
  })
*/
  //runs after the document is save in the query
  toursSchema.post('save', function(doc,next) {
   
    next();
  });

///this will run only before doing execute to a query. in my code this will run in the when we do a get request for all  of
///the tours  -- in function getAllTours. the reson for that is beacuse that in this function only we use the find method on a module
//that returns a query. so before we do excute to the query this pre find hook will runn
//if we want this function also to run when we do findbyId in the function handler get tour (only one tour)
// we will need to changee the find to be  : / ^find/ -- regular expression -- will run for every function that does a find
  toursSchema.pre('find',function(next){     

    this.find({secretTour:{$ne:true}})           ///this is the query-- the query that we get after doing .find in the function handler get all tours
    next();

  })

//will work for get one tour, update and get all tours
  toursSchema.pre(/^find/,function(next){     

    this.populate({               ///when we use refence relation between two document remember it will damge the performence!!!
        path:"guides",                 //beacuse when using populate we wil run another quety in the mongo db the query that will bring us the users from the user collection
        select:"-__v -_id"              //if we had emdded mening  the users where saved insde the tour so we just need to do a qury one the tour but now we do a qury on the tour
                                            //that gives us the tour with the id that we want and then another quryy on the user documents 
    }).populate("reviews")

    next();
  })


  toursSchema.post(/^find/,function(doc,next){

    next();

  })   // after the quert is excute we have allready the documnet that the query excuted so we can use the dociments here.
  ///  this. here is also the same this. in the pre -- the query itself

  
  toursSchema.pre('aggergate',function(next){     

    this.pipeline().unshift({$match:{secretTour:{$ne:true}}})      //this is the aggregate object ,pipeline is the array, we add to the beggining of the array a match        
    next();

  })
 


const Tour = mongoose.model('Tour',toursSchema);  ///Tour this is the collection!! the modal is the collection

module.exports =Tour;       // Tour this is the collection!!