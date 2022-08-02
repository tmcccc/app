const AppError = require('./../utils/appErr');

const tokerExpired = () => {
  return new AppError('the token had expired, please login again', 401);
};

const tokerIncorrect = () => {
  return new AppError('the token is not valid, please login again', 401); // 401 un athorized
};

const ValidatorError = (theErr) => {
  return new AppError(theErr.message, 400);
};

const duplicateKeyError = (theErr) => {
  const property = Object.keys(theErr.keyValue).join('');
  const value = Object.values(theErr.keyValue).join('');
  return new AppError(`${property} has already has the value ${value}`, 400);
};

const castError = (theErr) => {
  return new AppError(
    `${theErr.path} cant accept a the value ${theErr.value}`,
    400
  );
};
const errorDevelopment = (theErr, res) => {
  res.status(theErr.statusCode).json({
    status: theErr.status,
    message: theErr.message,
    theErr: theErr,
  });
};

const errorProduction = (theErr, res) => {
  if (theErr.ourError === true) {
    ///we want to send to the cluent error that he will understand them
    res.status(theErr.statusCode).json({
      status: theErr.status,
      message: theErr.message,
    });
  } else {
    //not our error

    res.status(500).json({
      status: 'error',
      message: 'somthing went very bad',
    });
  }
};

//this is the eeror midllaware we put it here because it is also a function handler
module.exports = (theErr, req, res, next) => {
  theErr.statusCode = theErr.statusCode || 500;
  theErr.status = theErr.status || 'error';

  if (process.env.NODE_ENV === 'development')
    return errorDevelopment(theErr, res);
  else if (process.env.NODE_ENV === 'production') {
    let { ...error } = theErr;

    error.message = theErr.message;

    if (theErr.name === 'CastError') error = castError(theErr);

    if (theErr.code === 11000) error = duplicateKeyError(theErr);

    if (theErr.name === 'ValidationError') error = ValidatorError(theErr);

    if (theErr.name === 'JsonWebTokenError') error = tokerIncorrect();

    if (theErr.name === 'TokenExpiredError') error = tokerExpired();

    errorProduction(error, res);
  }
};
