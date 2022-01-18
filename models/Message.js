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
  numberOfHours:{
    type:String,
    enum:["2"]
  },
  time: String,
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  ],
})

const messageJoi = Joi.object({
  numberOfHours:Joi.string().valid("2").required(),
  time: Joi.string().required(),
  
})
const messageEditJoi = Joi.object({
  time: Joi.string(),
})

const Message = mongoose.model("Message", messageSchema)

module.exports.Message = Message
module.exports.messageJoi = messageJoi
module.exports.messageEditJoi = messageEditJoi
