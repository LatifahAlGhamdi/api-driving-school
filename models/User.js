const mongoose = require("mongoose")

const Joi = require("joi")

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: String,
  avatar: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaIiybGGBefA9OihilA3sluTpfl5yj5C9QELiWa9ksFkgB6cw9Umysg61QYVb-kG3_eEg&usqp=CAU",
  },
  gender: {
    type: String,
    enum: ["female", "male"],
  },
  mobileNumber: String,
  anotherMobileNumber: String,
  ratings: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Rating",
    },
  ],
  messages: [
    {
    type: mongoose.Types.ObjectId,
    ref: "Message",
  }
],
  dateOfBirth: Date,
  nationalIDOrIqamaNumber: String,
  mobileNumber: String,
  anotherMobileNumber: String,
  experience: {
    type: String,
    enum: ["yes", "no"],
  },
  curriculumVitae: String,
  interview:
    {
    type: mongoose.Types.ObjectId,
    ref: "Interview",
    }
  ,
  interviewVerified: {
    type: Boolean,
  },
  appointments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Appointment",
    },
  ],
  role: {
    type: String,
    enum: ["Admin", "User", "Coach", "Inspector"],
    default: "User",
  },
})

const signUpJoi = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(120).required(),
  avatar: Joi.string().uri().min(6).max(1000).allow(""),
  gender: Joi.string().valid("female", "male").required(),
  mobileNumber: Joi.string().max(10).required(),
  anotherMobileNumber: Joi.string().max(10).allow(""),
})

const loginJoi = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(120).required(),
})

const profileEditJoi = Joi.object({
  firstName: Joi.string().min(2).max(100),
  lastName: Joi.string().min(2).max(100).allow(""),
  avatar: Joi.string().uri().min(6).max(1000),
  mobileNumber: Joi.string().max(10),
  anotherMobileNumber: Joi.string().max(10).allow(""),
})

const signUpCoachJoi = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(120).required(),
  avatar: Joi.string().uri().min(6).max(1000).allow(""),
  gender: Joi.string().valid("female", "male").required(),
  dateOfBirth: Joi.date().raw().required(), //
  nationalIDOrIqamaNumber: Joi.string().max(10).required(),
  mobileNumber: Joi.string().max(10).required(),
  anotherMobileNumber: Joi.string().max(10).allow(""),
  experience: Joi.string().valid("yes", "no").required(),
  curriculumVitae: Joi.string().uri().min(6).max(1000).required(),
})

const profileCoachEditJoi = Joi.object({
  firstName: Joi.string().min(2).max(100),
  lastName: Joi.string().min(2).max(100).allow(""),
  avatar: Joi.string().uri().min(6).max(1000),
  nationalIDOrIqamaNumber: Joi.string().max(10),
  mobileNumber: Joi.string().max(10),
  anotherMobileNumber: Joi.string().max(10).allow(""),
  experience: Joi.string().valid("yes", "no"),
  curriculumVitae: Joi.string().uri().min(6).max(1000),
})

const interviewVerifiedJoi = Joi.object({
  interviewVerified: Joi.boolean(),
})

const forgotPasswordJoi = Joi.object({
  email: Joi.string().email().required(),
})

const resetPasswordJoi = Joi.object({
  password: Joi.string().min(8).max(120).required(),
})

const User = mongoose.model("User", userSchema)

module.exports.User = User
module.exports.signUpJoi = signUpJoi
module.exports.loginJoi = loginJoi
module.exports.profileEditJoi = profileEditJoi
module.exports.signUpCoachJoi = signUpCoachJoi
module.exports.interviewVerifiedJoi = interviewVerifiedJoi
module.exports.profileCoachEditJoi = profileCoachEditJoi
module.exports.forgotPasswordJoi = forgotPasswordJoi
module.exports.resetPasswordJoi = resetPasswordJoi
