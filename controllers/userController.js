const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appErr");
const User = require('./../modeles//userModel');
const fuctory = require ('./fuctoryController')

const filter =  (obj, ...allowdFields)=>{

    const filterdObj = {};
    Object.keys(obj).forEach(el =>{
        if(allowdFields.includes(el))
            filterdObj[el] = obj[el] 
    } )

    return filterdObj
}

//update that user does
exports.updateMe = catchAsync( async(req,res,next) =>{

    if(req.body.password || req.body.passwordConfirm )
        return (next (new AppError("cant update password here. go to route updatePassword",400))) // 400 bad requst

    //we do this step in order to check if thje user is trying to update fileds that he doesnt have permiissopn to update like role 
    //we onle send to the function the fields that  the user is  allowd to update 
    const filterdObj = filter(req.body,'name','email')      
  
    
    //we use update here and no save because here we dont need to run the validation on confirm paasword and also the validato the we defind in pre hook  for save- the pre hook encrypts the password and
    // and in this function we dont do any change to the password this is the reason also that this function handler is writtend here and not in the authcontrroler -- becuse in this function
    //we dont check password or update password and also we dont do any check or somting else with the jwt/other token -- emaning we dont do in this praticuler function any athuntication
    console.log(req.user._id);
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filterdObj,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        status:"success",
        user :{
            updatedUser
        }
    })

})

//delete that user does
exports.deleteMe = catchAsync( async(req,res,next)=> {

    await User.findByIdAndUpdate(req.user._id,{active:false})

    res.status(204).json({
        status:"success",
        result:null
    })

})

exports.getAllUsers = (req,res)=>{
    
    res.status(500).json({
        status:"error",
        message:"this route is not define"

    })
}

exports.newUser = (req,res)=>{
    
    res.status(500).json({
        status:"error",
        message:"this route is not define"

    })
}

//rememcet : dont updated the password because findoneandupdate doesnt do the pre save middelwears where we encrypd the password
//this update is for the adminstrator
exports.updateUser =  fuctory.updateOne(User)

exports.getUser = (req,res)=>{
    
    res.status(500).json({
        status:"error",
        message:"this route is not define"

    })
}


//this delete if for the adminstrator
exports.deleteUser = fuctory.deleteOne(User)

