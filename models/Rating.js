const mongoose = require("mongoose")
const Joi = require("joi")
const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  rating: Number,
  coachId :{
    type:mongoose.Types.ObjectId,
    ref:"User"
  }
})

const ratingJoi = Joi.object({
  rating: Joi.number().min(0).max(5).required(),
})

const Rating = mongoose.model("Rating", ratingSchema)

module.exports.Rating = Rating
module.exports.ratingJoi = ratingJoi
