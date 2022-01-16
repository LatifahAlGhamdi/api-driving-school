const mongoose = require("mongoose")

const Joi = require("joi")

const interviewSchema = new mongoose.Schema({
  inspectorId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  date: Date,
})

const interviewJoi = Joi.object({
  date: Joi.date().raw().required(),
})

const Interview = mongoose.model("Interview", interviewSchema)

module.exports.Interview = Interview
module.exports.interviewJoi = interviewJoi
