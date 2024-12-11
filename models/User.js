// Replace this file with the definition of the data models
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter a username"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  adoptedDogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dog'
  }],
  registeredDogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dog'
  }]
});

//hashing the password before saving it
userSchema.pre("save", async function (next) {
  //const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, 10);
  console.log("password hashed successfully")
  next();
});

//create a static function to validate login by comparing entered password with saved
userSchema.statics.validateLogin = async function (username, password) {
  const findUser = await this.findOne({ username });
  if (findUser) {
    const auth = await bcrypt.compare(password, findUser.password)
    if (auth) return findUser;
    throw Error("Incorrect password! Please try again.");
  } else {
    throw Error("Incorrect username! Please try again");
  }
};

//create our model based on the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
