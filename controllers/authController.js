//thr token is the jwt!!!!!
const User = require('./../modeles//userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils//appErr');
const sendEmail = require('./../utils/email');

const crypto = require('crypto');
const { promisify } = require('util');
const jsonWebToken = require('jsonwebtoken');

const createToken = (id) =>
  jsonWebToken.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPERATION_DATE,
  });

const RespondToken = (res, user, status) => {
  const token = createToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPERATION_DATE * 24 * 60 * 60 * 1000
    ), //to miliseconds
    httpOnly: true, //nowone can  accesse to cookie from the broweser and change the jwt
  };

  if (process.env.NODE_ENV === 'production')
    //because in postman we dont send https -that is the secured
    cookieOption.secure = true;

  res.cookie('jwt', token, cookieOption); //first agumnt the name of the cookie, second the value of the cookie
  res.status(status).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  //the acnchronize opration is saving the document in the mongo db- when the asnchronize opartion is over we res(newdoc) or rej the promise -- changes the state pf the promise
  //the function create, creates a new promise and retunrs it. inside the executer of the promise  a document object is cretad, we cheack that this
  //document is valid according to the rules of the schema of the model. if its not valid we reject the promise with a error validation.
  //if it is valid then we weill run the pre save hook. the pre save hook is a function of the object document , because of this the this. vraible
  //points to the document if everything goes ok in the pre save hook we will do the aschbcornize opration saving the document in the collectiom in the meanwhile
  //the promoise object status is pending  and the thread of node is not block it can deal with other requset. when the ascnchronize opration is finished
  //we get a call back function that does res(newdoc) or rej(err). the the status of the promise is change then we can continue running in the async function
  const newUserDocument = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm, //we do it like that from security reasons, if we will do create()  then the user can give a valee to the role field - to be a admin
  });

  RespondToken(res, newUserDocument, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('didnt enter a password or a email', 400)); //beacuse that we are passing a argument to the next we will go to the global error middelware if we just called next with out a argument we will go to the next with the '*""

  let query = User.findOne({ email }).select('+password'); //beacuse that password is defined in the schema as select:false we need to specified that we want it when cwe do a query     ///no need to do email:email
  const userDoc = await query; //res(document)

  if (!userDoc || !(await userDoc.correctPassword(password, userDoc.password)))
    return next(new AppError('email or password incorrect', 400));

  userDoc.password = undefined;
  RespondToken(res, userDoc, 200);
});
//this function is athontication
exports.protected = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  )
    return next(
      new AppError('you are not log in, please log in to get access', 401)
    );

  const token = req.headers.authorization.split(' ')[1];

  const decoded = await funDecoded(token); ///the decoses ia the  payload in our case its only the user id beacuse when we creted the jwt -token we putted in the payload only the id of the user

  //url here we checked that the token is valid
  console.log(decoded);

  existedUser = await User.findById(decoded.id); //check  if user isnot delet fron db
  console.log(existedUser);

  if (!existedUser)
    return next(new AppError('please sign in again to the site', 401)); //401 un athorized

  const changedPassword = existedUser.passwordChnaged(decoded.iat); //cgeck is password was vahnge after creating the token iat =issued at

  if (changedPassword)
    return next(
      new AppError('please login again- password has been changed', 401)
    );

  req.user = existedUser;

  next();
});

///can also  use promosfiy!!!!!
const funDecoded = (token) => {
  return new Promise((res, rej) => {
    jsonWebToken.verify(token, process.env.SECRET_KEY, (err, decode) => {
      if (err) rej(err); //error cam be token is not valid or token has expire we catch them in the global next error

      res(decode);
    });
  });
};

//this function is athorization

exports.restrictTo = (...withPermissions) => {
  return (req, res, next) => {
    if (!withPermissions.includes(req.user.role))
      return next(
        new AppError('you dont have premissins to delete a tour', 403)
      ); ///403  forbidden

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('user with this email doesnt exist', 404)); //404 not found

  const resetToken = user.createEncryptedPasswordForForgot();

  await user.save({ validateBeforeSave: false });

  const requstUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${requstUrl}.
                        \nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password rest token is valid for ten min',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token has been sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExperation = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('there was an error sending the email please try again')
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetTokenExperation: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('token is invalid or expired', 400)); //400 bad requst

  user.password = req.body.password; //   const {password,passwordConfirm} = req.body;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExperation = undefined;

  await user.save();

  RespondToken(res, user, 201);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id }).select('+password');

  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  if (!(await user.correctPassword(oldPassword, user.password)))
    return next('current password that was enter usnt correct', 401); // un athorized

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save(); //not using updat because then the validator of confirmpassword will not  workd and aloo the hook of pre save will not work

  RespondToken(res, user, 201);
});
