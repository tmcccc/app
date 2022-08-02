const express = require('express');

const app = express();
const morgen = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const AppError = require('./utils/appErr');
const errorMiddelware = require('./controllers/errorController');
const toursRoutes = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviwRouter = require('./routes/reviewRoutes');

console.log(process.env.NODE_ENV);

app.use(helmet());

//development loging
if (process.env.NODE_ENV == 'development') app.use(morgen('dev'));

//parser body , reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

app.use(express.static(`${__dirname}/public`));

//retuens a middalure this middalware will take out from the req.body , req,params, req.query
//all the dots and dollar signs - signs that are use in mongo
app.use(mongoSanitize());

app.use(xssClean());

app.use((req, res, next) => {
  console.log('hello from second midllware ');
  next();
});

//limits requst from same ip
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'please try agaun in a hour',
});

app.use('/api/', apiLimiter); //apilimiter is a middelware

app.use((req, res, next) => {
  //console.log(x)  this will cause an eror that will go to the global middelware error that is beacuse that when ther is a erro in a middleware it will go autmatic to the global midellware error if the error was outside the midellware then we will go to the listener
  req.time = new Date().toISOString();
  next();
});

//prevent parameter pooution
app.use(
  hpp({
    whitelist: ['duration', 'price'],
  })
);

app.use('/api/v1/tours', toursRoutes); //tourRoutes is also a middlleware!!!
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/review', reviwRouter);

app.all('*', (req, res, next) => {
  const err1 = new AppError(`this ${req.originalUrl} does not exist`, 404);
  next(err1);
});

//this middelewaer wiil be called only if a middleware that is on the top of this curreunt middlare (stack) will do next(with a argument);
app.use(errorMiddelware);

/*
app.use((req,res,next)=>
{
    res.status('404').json({
        status:"faild",
        message:`this ${req.originalUrl} doesnt exist`
    })
})
*/

module.exports = app;
