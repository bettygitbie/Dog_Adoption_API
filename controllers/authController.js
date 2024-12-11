// Replace this file with the logic for handling incoming requests and returning responses to the client
const express = require("express");
const User = require("../models/User");
const Dog = require("../models/Dog");
const jwt = require("jsonwebtoken");

const maxAge = 24 * 60 * 60 * 1000;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

module.exports.register_get = (req, res) => {
  res.render("register");
};
module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.user_get = (req, res) => {
  res.render("user");
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

module.exports.register_post = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.create({ username, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge });
    res.status(201).json({ user: `${username} registered successfully` });
  } catch (err) {
    const error = handleError(err);
    res.status(400).json({ error });
  }
};

module.exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.validateLogin(username, password);
    console.log(user);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge });
    res.status(200).json({ user: `${user.username} logged in!` });
  } catch (err) {
    res.status(404).json({ message: `${err}` });
  }
};

module.exports.registered_get = async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: "registeredDogs",
    select: "name description isAdopted",
  });
  if (user.registeredDogs.length === 0) {
    res.status(400).json({ message: "No registered dogs!" });
  } else {
    res.status(200).json(user.registeredDogs);
  }
};

module.exports.adopted_get = async(req,res)=>{
    const user = await User.findById(req.user.id).populate({
        path: "adoptedDogs",
        select: "name description",
      });
      if (user.adoptedDogs.length === 0) {
        res.status(400).json({ message: "No adopted dogs!" });
      } else {
        res.status(200).json(user.adoptedDogs);
      }
}

module.exports.dog_post = async (req, res) => {
  const { name, description } = req.body;
  try {
    const dog = await Dog.create({ name, description });
    const user = await User.findById(req.user.id);
    user.registeredDogs.push(dog._id);
    await user.save();
    res.status(201).json({ Dog: `${dog.name} registered successfully` });
  } catch (err) {
    res.status(400).json({ err });
  }
};

module.exports.dog_adopt = async (req, res) => {
  const dogId = req.params.id;
  try {
    const user = await User.findById(req.user.id);
    const dog = await Dog.findById(dogId);

    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }
    if (user.registeredDogs.includes(dog._id)) {
      return res
        .status(400)
        .json({ message: "You cannot adopt your registered dog" });
    }
    if (dog.isAdopted) {
      return res.status(400).json({ message: "This dog is already adopted" });
    }
    dog.adopt();
    await dog.save();

    user.adoptedDogs.push(dog._id);
    await user.save();

    res.json({ message: "Dog adopted successfully", dog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.remove_dog = async (req, res) => {
  const dogId = req.params.id;
  try {
    const dog = await Dog.findById(dogId);
    const user = await User.findById(req.user.id);
    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }
    if (!user.registeredDogs.includes(dog._id)) {
      return res
        .status(403)
        .json({ message: "You can not remove someone else's registered dog" });
    }
    if (dog.isAdopted) {
      return res.status(403).json({
        message: `The dog ${dog.name} is adopted and can't be removed!`,
      });
    }
    await User.updateOne(
      { _id: user._id },
      { $pull: { registeredDogs: `${dogId}` } }
    );
    await Dog.deleteOne(dog);

    return res.status(201).json({ message: "Dog removed successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const handleError = (err) => {
  let errors = { username: "", password: "" };

  if (err.code === 11000) {
    errors.username = "That username is already registered";
  }

  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  } else {
    console.log(err.message);
  }
  return errors;
};
