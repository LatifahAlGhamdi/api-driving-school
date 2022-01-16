const mongoose = require("mongoose")
const Joi = require("joi")
const req = require("express/lib/request")

const messageSchema = mongoose.Schema({
  userId:{
    type:mongoose.Types.ObjectId,
    ref:"User"
  },
  coachId:{
    type:mongoose.Types.ObjectId,
    ref:"User"
  },
  numberOfHours:Number,
  time: String,
  price: Number,
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  ],
})

const messageJoi = Joi.object({
  numberOfHours:Joi.number().min(0).max(30).required(),
  time: Joi.string().max(20).required(),
  price: Joi.number().min(0).max(5000).required(),
})
const messageEditJoi = Joi.object({
  numberOfHours:Joi.number().min(0).max(30),
  time: Joi.string(),
  price: Joi.number().min(0).max(5000),
})

const Message = mongoose.model("Message", messageSchema)

module.exports.Message = Message
module.exports.messageJoi = messageJoi
module.exports.messageEditJoi = messageEditJoi
