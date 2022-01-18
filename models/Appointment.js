const mongoose = require("mongoose")
const Joi = require("joi")
const JoiObjectId = require("joi-objectid")
Joi.objectid = JoiObjectId(Joi)

const appointmentSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  name: String,
  skill:{
    type:String,
    enum:["I have a skill", "I don't have a skill"]
  },
  coachId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
})

const appointmentJoi = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  skill:Joi.string().valid("I have a skill", "I don't have a skill").required(),
})

const appointmentEditJoi = Joi.object({
  name: Joi.string().min(2).max(120),
})


const Appointment = mongoose.model("Appointment", appointmentSchema)

module.exports.Appointment = Appointment
module.exports.appointmentJoi = appointmentJoi
