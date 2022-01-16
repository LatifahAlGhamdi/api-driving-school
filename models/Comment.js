const mongoose = require("mongoose")
const Joi = require("joi")

const commentSchema = mongoose.Schema({
  userId:{
    type:mongoose.Types.ObjectId,
    ref:"User"
  },
  comment: String,
  coachId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
})

const commentJoi = Joi.object({
  comment: Joi.string().min(2).max(1000).required(),
})

const commentEditJoi = Joi.object({
  comment: Joi.string().min(2).max(1000),
})

const Comment = mongoose.model("Comment", commentSchema)

module.exports.Comment = Comment
module.exports.commentJoi = commentJoi
module.exports.commentEditJoi = commentEditJoi
