
///this is closure!!!!!!!!!!!!!! a function returns a function
 module.exports = (fn) =>{
          
    console.log("qqqqqqqqqqqqqqqq");
    return( async (req,res,next)=>{

        try{
        await fn(req,res,next);    
        }

        catch(err){
            next(err);   //global error middleware
        }
    })

}
