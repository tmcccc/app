const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'a name must be enterd'],
  },

  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'email is not correct'],
  },

  photo: String,

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'please enter a password'],
    trim: true,
    minlength: [8, 'passwprd must contain at list 8 charcters'],
    select: false,
  },

  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (val) {
        ///works only in creating new documents douesnt work on update
        return val === this.password; ///this. is the document
      },

      message: 'passwords must mach',
    },
  },

  changePassword: Date,
  passwordResetToken: String,
  passwordResetTokenExperation: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//this. is the document

userSchema.pre('save', async function (next) {
  // runs before the asnichornize opration -- saving the document in the monfodb

  if (this.isModified('password')) {
    if (!this.isNew) this.changePassword = Date.now();

    this.password = await bcryptjs.hash(this.password, 12); //returns a new promise object with a statue pending in the executer of the promise we do the acinchorinze opration crypting the password
    this.passwordConfirm = undefined;
  }

  next();
});

/* exmpale how promisw works
exports.hash = (pass,strenth )=>{


    return (new Promise ((res,rej)=>{

        hash(pass,strenth, (err,newpass)=>{
            if(err)
                rej(err)

                res(newpass)
        } ) 
    }))
}
*/

userSchema.post('save', function () {
  this.password = undefined;
});

//this is a funtiob that every document will have- instance method
userSchema.methods.correctPassword = async function (
  originPassword,
  crypyPassword
) {
  return await bcryptjs.compare(originPassword, crypyPassword);
};
//this will be invoked also in login and also in protected function beacuse we use find ther
//the this key word point to the query
//this will also be inviked in get all users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.passwordChnaged = function (timeStampToken) {
  if (this.changePassword) {
    console.log(parseInt(this.changePassword.getTime() / 1000));
    console.log(timeStampToken);
    return parseInt(this.changePassword.getTime() / 1000) > timeStampToken;
  }
};

userSchema.methods.createEncryptedPasswordForForgot = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExperation = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
