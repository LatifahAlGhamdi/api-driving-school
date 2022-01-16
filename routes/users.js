const express = require("express")
const checkAdmin = require("../middleware/checkAdmin")
const checkId = require("../middleware/checkId")
const { User, signUpJoi, loginJoi, profileEditJoi } = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const checkUser = require("../middleware/checkUser")
const checkCoach = require("../middleware/checkCoach")
const validateId = require("../middleware/validateId")
const { Rating, ratingJoi } = require("../models/Rating")
const { messageJoi, Message, messageEditJoi } = require("../models/Message")
const { commentJoi, Comment, commentEditJoi } = require("../models/Comment")
const { Appointment } = require("../models/Appointment")
const router = express.Router()
const nodemailer = require("nodemailer");

/*----------------------------------------- signupAdmin -------------------------------------------------*/
router.post("/add-admin", checkAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar, gender, mobileNumber, anotherMobileNumber } = req.body
    const result = signUpJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).send("user already reqistered")

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      avatar,
      gender,
      mobileNumber,
      anotherMobileNumber,
      // emailVerified: false,
      role: "Admin",
    })
    await user.save()
    delete user._doc.password
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/login/admin", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).send("user already reqistered") // اذا الايميل مو موجود في الداتا بيس رجعلي error
    if (user.role != "Admin") return res.status(403).send("you are not admin")

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).send("password incorrect")

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })
    res.send(token)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

/*---------------------------------------------- Login Inspector ---------------------------------------*/

router.post("/login/inspector", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).send("user already reqistered") // اذا الايميل مو موجود في الداتا بيس رجعلي error
    if (user.role != "Inspector") return res.status(403).send("you are not inspector")

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).send("password incorrect")

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })
    res.send(token)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
/*-------------------------------------------------- User ----------------------------------------------*/

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar, gender, mobileNumber, anotherMobileNumber } = req.body
    const result = signUpJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).send("user already reqistered")

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      avatar,
      gender,
      mobileNumber,
      anotherMobileNumber,
      emailVerified: false,
      role: "User",
    })

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: "drivingschool970@gmail.com",
        pass: "qwert567",
      },
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15d",
    });
    await transporter.sendMail({
      from: `"Driving School"<drivingschool970@gmail.com>`,
      to: email,
      subject: "Email verification",
      html: `hello, plase click on this link to verify your email.
       <a href='http://localhost:3000/verify_email/${token}'> verify email</a>`,
    });
    await user.save()
    delete user._doc.password
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})



router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const result = loginJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const userFound = await User.findOne({ email })
    if (!userFound) return res.status(404).send("user not found")
    
    const valid = await bcrypt.compare(password, userFound.password)
    if (!valid) return res.status(400).send("password incorrect")

    if (!userFound.emailVerified) return res.status(403).send("user not verified, please check your email")
    const token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })
    res.send(token)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/verify_email/:token", async (req, res) => {
  try {
    const decryptedToken = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET_KEY
    );
    const userId = decryptedToken.id;

    const user = await User.findByIdAndUpdate(userId, {
      $set: { emailVerified: true },
    });
    if (!user) return res.status(404).send("user not found");

    res.send("user verified");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/profile", checkUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-__v -password -interviewVerified ")
      .populate("interview")
      .populate("appointments")
      .populate("ratings")
      .populate("messages")
      

    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})


router.get("/profile/user/appointments", checkUser, async (req, res) => {
  const appointment = await Appointment.find({ userId: req.userId }).populate("coachId").select("-__v")
  res.json(appointment)
})

router.get("/profile/user/ratings", checkUser, async (req, res) => {
  const rating = await Rating.find({ userId: req.userId })
    .populate({
      path: "coachId",
      populate: {
        path: "ratings",
      },
    })
    .select("-__v")
  res.json(rating)
})

router.get("/profile/user/messages",checkUser, async (req, res) => {
  const message = await Message.find({ userId: req.userId })
    .populate("coachId")
    .populate("comments")
    .select("-__v")
  res.json(message)
})

router.get("/profile/user/comments",checkUser, async (req, res) => {
  const comment = await Comment.find({ userId: req.userId })
    .populate("coachId")
    .select("-__v")
  res.json(comment)
})


router.put("/profile", checkUser, async (req, res) => {
  try {
    const { firstName, lastName,  avatar, gender, mobileNumber, anotherMobileNumber } = req.body
    const result = profileEditJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { firstName, lastName, avatar, gender, mobileNumber, anotherMobileNumber } },
      { new: true }
    )
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/users", checkAdmin, async (req, res) => {
  try {
    const user = await User.find({ role: "User" })
      .select("-__v -password -interviewVerified")
      .populate("ratings")
      .populate("messages")

    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
router.get("/admins", checkAdmin, async (req, res) => {
  try {
    const user = await User.find({ role: "Admin" }).select("-__v -password -interviewVerified")
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
router.delete("/users/:userId", checkAdmin, checkId, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).send("user not found")

    await Appointment.deleteMany({userId:req.params.userId})
    await Rating.deleteMany({userId:req.params.userId})
    await Message.deleteMany({userId:req.params.userId})
    await Comment.deleteMany({userId:req.params.userId})
    
    await User.findByIdAndRemove(req.params.userId)
    res.send("user removed")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

/*-------------------------------------------------------Rating------------------------------------------------------*/

router.post("/users/:userId/rating", checkCoach, validateId("userId"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("ratings")
    if (!user) return res.status(404).send("user not found")

    const coach = await User.findById(req.userId)
    if (!coach) return res.status(404).send("coach not found")
    console.log(user)
    console.log(coach)

    const { rating } = req.body

    const result = ratingJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const newRating = new Rating({
      rating,
      userId: req.params.userId,
      coachId: req.userId,
    })

    const ratingFound = user.ratings.find(ratingObject => ratingObject.coachId == req.userId)
    console.log(ratingFound)
    
    if (ratingFound) return res.status(400).send("coach already rated this user")
    await newRating.save()
    await User.findByIdAndUpdate(req.params.userId, { $push: { ratings: newRating } }, { new: true })
    await User.findByIdAndUpdate(req.userId, { $push: { ratings: newRating } }, { new: true })
    res.json(newRating)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

/*---------------------------------------- message -------------------------------------------------------*/

router.post("/users/:userid/message", checkCoach, validateId("userid"), async (req, res) => {
  try {
    const { numberOfHours, time, price } = req.body
    const result = messageJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const user = await User.findById(req.params.userid).populate("messages" ).populate("ratings")
  if (!user) return res.status(404).send("user is not found")

    const coach = await User.findById(req.userId)
    if (!coach) return res.status(404).send("coach not found")

    const ratingFound = user.ratings.find(ratingObject => ratingObject._id == ratingObject._id)
    console.log(ratingFound)
    
    if (!ratingFound) return res.status(400).send("coach must rate this user")

    const newMessage = new Message({
      userId:req.params.userid,
      coachId: req.userId,
      numberOfHours,
      time,
      price,
    })

    const messageFound = user.messages.find(messageObject => messageObject.coachId == req.userId)
    console.log(messageFound)
    if (messageFound) return res.status(400).send("coach already messaged this user")
    await newMessage.save()
    
    await User.findByIdAndUpdate( req.params.userid,{ $push: { messages: newMessage._id } },{ new: true })
    await User.findByIdAndUpdate(req.userId, { $push: { messages: newMessage._id } }, { new: true })
    res.json(newMessage)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// router.get("/users/:userId/message", checkCoach, validateId("userId"), async (req, res) => {
//   const message = await Message.find()
//   res.json(message)
// })

router.put("/users/:userId/message/:messageId", validateId("userId", "messageId"), async (req, res) => {
  try {
    const {numberOfHours, time, price } = req.body
    const result = messageEditJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).send("user is not found")

    const message = await Message.findById(req.params.messageId)
    if (!message) return res.status(404).send("message is not found")

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.messageId,
      { $set: {numberOfHours, time, price } },
      { new: true }
      
    )
    res.json(updatedMessage)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.delete("/users/:userId/message/:messageId", validateId("userId", "messageId"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).send("user is not found")

    const message = await Message.findById(req.params.messageId)
    if (!message) return res.status(404).send("message is not found")

    await Message.findByIdAndRemove(req.params.messageId)
    res.send("message removed")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

/*----------------------------------------------- comment -----------------------------------------------------*/

router.post(
  "/message/:messageId/comments",
  checkCoach,
  validateId("messageId"),
  async (req, res) => {
    try {
      const { comment } = req.body

      const result = commentJoi.validate(req.body)
      if (result.error) return res.status(400).send(result.error.details[0].message)


      const message = await Message.findById(req.params.messageId)
      if (!message) return res.status(404).send("message is not found")

      const newComment = new Comment({
        userId:message.userId,
        comment,
        coachId: req.userId,
      })

      await newComment.save()

     await Message.findByIdAndUpdate(
        req.params.messageId,
        { $push: { comments: newComment._id } },
        { new: true }
      )
      res.json(newComment)
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
)



router.put(
  "/message/:messageId/comments/:commentId",
  checkCoach,
  validateId("messageId", "commentId"),
  async (req, res) => {
    try {
      const { comment } = req.body

      const result = commentEditJoi.validate(req.body)
      if (result.error) return res.status(400).send(result.error.details[0].message)
 
      const message = await Message.findById(req.params.messageId)
      if (!message) return res.status(404).send("message is not found")

      const user = await User.findById(message.userId)
      if (!user) return res.status(404).send("user is not found")

      const commentFound = await Comment.findById(req.params.commentId)
      if (!commentFound) return res.status(404).send("comment is not found")

      if (message.coachId != req.userId) return res.status(403).send("unauthorized action")
      // if (message.comments.includes(req.params.commentId))

      const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, { $set: { comment } }, { new: true })
      res.json(updatedComment)
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
)

router.delete(
  "/message/:messageId/comments/:commentId",
  checkCoach,
  validateId("messageId", "commentId"),
  async (req, res) => {
    try {
      
      const message = await Message.findById(req.params.messageId)
      if (!message) return res.status(404).send("message is not found")
     
      const user = await User.findById(message.userId)
      if (!user) return res.status(404).send("user is not found")

      const commentFound = await Comment.findById(req.params.commentId)
      if (!commentFound) return res.status(404).send("comment is not found")

      if (message.coachId != req.userId) return res.status(403).send("unauthorized action")
      if (message.comments.includes(req.params.commentId))


      await Message.findByIdAndUpdate(req.params.messageId, { $pull: { comments: req.params.commentId } }, { new: true })
      await Comment.findByIdAndRemove(req.params.commentId)
      res.send("comment removed")
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
)
module.exports = router
