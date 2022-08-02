//json.parse and console.olg are ascnchrnes actions!!!!!!!!!!!

const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  //listner
  console.log('a error happend');
  console.log(err);
});

dotenv.config({ path: './confing.env' });
console.log(process.env.DATABASE_PASSWORD);

/*
console.log(process.argv[0] )
console.log(process.argv[1] )
console.log(process.argv[2] )
console.log(process.argv[3] )
*/

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect('mongodb://localhost:27017/myapp')
  .then(() => console.log('connected to db'));

const app = require('./app');

const server = app.listen(process.env.port, () =>
  console.log('start listning')
);

process.on('unhandledRejection', (err) => {
  //listener
  console.log('a error happend');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
