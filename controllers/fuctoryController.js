const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appErr");

exports.deleteOne = model => 
//console.log("ggggggggggggggssssssssssssgggggg")  //will run
catchAsync (async (req,res,next)=>{

    
    const deletedDoc= await model.findByIdAndDelete(req.params.id);

    
    if(!deletedDoc)
        return next(new AppError('no document found with that id',404))  
    res.status(204).json({
        status:"success",
        result:null
    })
    

})

exports.updateOne = model =>
catchAsync (async (req,res,next)=>{


    const updatedDoc= await model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })

    if(!updatedDoc)
        return next(new AppError('no tour found with that id',404))  

    res.status("201").json({
        status:"success",
        data: {
            data:updatedDoc
        }
    })

})


exports.createOne = model =>
    catchAsync (async (req,res)=>{
        // console.log(req.body);
          const newDoc = await model.create(req.body);
         
          //  const newTour = await tour.insertMany(req.body);
             res.status("201").json({
                 status:"success",
                 data: {
                     data:newDoc
                 }
             })
     
     
     });


