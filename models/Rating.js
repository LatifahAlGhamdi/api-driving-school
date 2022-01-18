const mongoose = require("mongoose")
const Joi = require("joi")
const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  numberOfHours:{
    type:String,
    enum:["6","15","30"]
  },
  price: Number,
  coachId :{
    type:mongoose.Types.ObjectId,
    ref:"User"
  }
})

const ratingJoi = Joi.object({
  numberOfHours: Joi.string().valid("6","15","30").required(),
  price: Joi.number().min(0).max(5000).required(),
})

const Rating = mongoose.model("Rating", ratingSchema)

module.exports.Rating = Rating
module.exports.ratingJoi = ratingJoi
