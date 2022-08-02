///this are the functions handlers they are also middeleware the return a responed to client
const tour = require('../modeles/tourModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErr');
const factory = require('./fuctoryController');

exports.fiveCheapes = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingAvrage,price';
  req.query.fields = 'ratingAvrage,price,name,difficulty,duration,summary';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  const features = new ApiFeatures(tour.find(), req.query); //toue is the module (collection) that is build from the schema  find returns a query
  features.filterQuery().sortingQuery().fieldsquery().pagingQuery();

  //what we have is simalr to tour.find(...).sort.(..).select(..).skip..   ecery dunctio return a query that alloeas us to cakk the next function

  const allTours = await features.query; //we can also do features.query.exec() //creates a promise the executer runs and does the aschronizae opration in this case it is to bring from the db all the documents acoording to the query. if the asnchornize operation succeded then the promise is resolved --- resolve(documents)
  // const allTours =await tour.find().where("duration").equals(5).where("difficulty").equals("easy"); //another way to do quering
  const time = req.time;
  res.status(200).send({
    status: 'success',
    result: allTours.length,
    time: time,
    data: {
      allTours: allTours,
    },
  });
});

exports.getTour = catchAsync(
  async (
    req,
    res,
    next //will call imidiatily the function catchAsync
  ) => {
    //const p = await Band.find({}).populate('members')

    //const Thetour =  await tour.findById(req.params.id).populate("qqqqqqqw")
    const Thetour = await tour.findOne({ _id: req.params.id });
    //const Thetour = await tour.find({_id:req.params.id})
    //Thetour.a= "aa";    //will not work only works in pre save hook!
    //Thetour_doc..a="aaa"//will work
    ///Thetour.price=2000 ,Thetour.price=undifyned will woerk
    //the same bhevior in post find hook and methods for documents
    if (!Thetour) return next(new AppError('no tour found with that id', 404)); //when its id (the param) is a valid _id in mongose but there isnt a document with that id- in this case momgoe retirns a resolve promise withou a document its not a rejected
    res.status(200).json({
      status: 'Thetour',
      tour: Thetour,
    });
  }
);

exports.newTour = factory.createOne(tour);

exports.updateTour = factory.updateOne(tour);

exports.deleteTour = factory.deleteOne(tour);

exports.getTourStat = catchAsync(async (req, res) => {
  const aggergate = tour.aggregate([
    // every documnt goes throw the aggergation pipe line///returns a aggragte object, waht is written in the array is the pipe line of the aggregate if i will do aggergate.pipeline() ill get everty thinsg that I wrote inside the array---- match.. group ...
    {
      $match: { maxGroupSize: { $lte: 22 } },
    },

    {
      $group: {
        _id: '$difficulty',
        numOfTours: { $sum: 1 },

        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    {
      $sort: { avgPrice: -1 },
    },

    {
      $match: { minPrice: { $gte: 500 } },
    },
  ]);

  console.log(aggergate.pipeline()); ///here I can see what i puted inside the array
  const agger = await aggergate; ///equals to aggergate.exec() return resolve(documents)

  res.status('200').json({
    status: 'success',
    lentgh: agger.length,
    result: agger,
  });
});

exports.ToursByMonth = catchAsync(async (req, res) => {
  const year = req.params.year * 1;

  const agger = await tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $substr: ['$startDates', 5, 2] }, //id:{$month:'$startdates'}
        numOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },

    {
      $project: {
        _id: 0,
      },
    },

    {
      $sort: {
        numOfTours: 1,
      },
    },

    {
      $limit: 3,
    },
  ]);

  res.status('200').json({
    status: 'success',
    lentgh: agger.length,
    result: agger,
  });
});
