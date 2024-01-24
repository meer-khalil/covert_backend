const { Schema } = require("mongoose");
const User = require("../models/user.model");
const dayjs = require("dayjs");

const getUser = (user) => user.hidePassword();

const createUser = (user) => new User(user);


const findUserBy = async (prop, value) =>
  await User.findOne({ [prop]: value });

const findUserById = async (id) => await User.findById(id);

const saveUser = async (user) => await user.save();

const deleteUserById = async (user) => await User.findByIdAndDelete(user._id);


module.exports = {
  getUser,
  createUser,
  deleteUserById,
  findUserBy,
  findUserById,
  saveUser
}