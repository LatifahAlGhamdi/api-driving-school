const express = require("express")
const checkAdmin = require("../middleware/checkAdmin")
const checkCoach = require("../middleware/checkCoach")
const checkUser = require("../middleware/checkUser")
const validateId = require("../middleware/validateId")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { Appointment, appointmentJoi, appointmentEditJoi } = require("../models/Appointment")
const { Interview, interviewJoi } = require("../models/Interview")
const { User, interviewVerifiedJoi, signUpCoachJoi, profileCoachEditJoi, forgotPasswordJoi, resetPasswordJoi } = require("../models/User")
const checkInspector = require("../middleware/checkInspector")
const { Rating } = require("../models/Rating")
const { Message } = require("../models/Message")
const { Comment } = require("../models/Comment")
const nodemailer = require("nodemailer");
const router = express.Router()


router.post("/signup-coach", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      avatar,
      gender,
      dateOfBirth,
      nationalIDOrIqamaNumber,
      mobileNumber,
      anotherMobileNumber,
      experience,
      curriculumVitae,
    } = req.body
    const result = signUpCoachJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const coachFound = await User.findOne({ email })
    if (coachFound) return res.status(404).send("coach already reqistered")

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const coach = new User({
      firstName,
      lastName,
      email,
      password: hash,
      avatar,
      gender,
      dateOfBirth,
      nationalIDOrIqamaNumber,
      mobileNumber,
      anotherMobileNumber,
      experience,
      curriculumVitae,
      role: "Coach",
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

    const token = jwt.sign({ id: coach._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15d",
    });
    await transporter.sendMail({
      from: `"Driving School"<drivingschool970@gmail.com>`,
      to: email,
      subject: "Email verification",
      html: `hello, plase click on this link to verify your email.
       <a href='https://react-driving-school.herokuapp.com/verify_email_coach/${token}'> verify email</a>`,
    });

    await coach.save()
    delete coach._doc.password
    res.json(coach)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).send("user already reqistered") 
    if (user.role != "Coach") return res.status(403).send("you are not Coach")

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).send("password incorrect")
    if (!user.emailVerified) return res.status(403).send("user not verified, please check your email")
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })
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

router.post("/forgot-password", async (req, res)=>{
  try{
    const {email} = req.body
    
    const result= forgotPasswordJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)
    
    const userFound = await User.findOne({ email })
    if (!userFound) return res.status(404).send("user not found")
  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: "drivingschool970@gmail.com",
        pass: "qwert567",
      },
    });
    const token = jwt.sign({ id: userFound._id, forgotPassword:true }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15d",
    });
    await transporter.sendMail({
      from: `"Driving School"<drivingschool970@gmail.com>`,
      to: email,
      subject: "Email verification",
      html: `hello, plase click on this link to reset your password.
       <a href='https://react-driving-school.herokuapp.com/reset-password-coach/${token}'>Reset password</a>`,
    });
    res.send("forgot password link sent")
  }catch (error) {
    res.status(500).send(error.message);
  }
})

router.post("/reset-password/:token", async (req,res)=>{
  try{
  const result= resetPasswordJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const decryptedToken = jwt.verify(req.params.token, process.env.JWT_SECRET_KEY)

    if (!decryptedToken.forgotPassword) return res.status(403).send("unauthorized action")
    const userId = decryptedToken.id

    const userFound = await User.findById(userId)
    if (!userFound) return res.status(404).send("user not found")

    const {password}=req.body

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    await User.findByIdAndUpdate(userId, {$set:{password:hash}})
    res.send("password reset")
  }catch (error) {
      res.status(500).send(error.message);
    }
} )

router.put("/profile", checkCoach, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      avatar,
      nationalIDOrIqamaNumber,
      mobileNumber,
      anotherMobileNumber,
      experience,
      curriculumVitae,
    } = req.body
    const result = profileCoachEditJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const coach = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          firstName,
          lastName,
          avatar,
          nationalIDOrIqamaNumber,
          mobileNumber,
          anotherMobileNumber,
          experience,
          curriculumVitae,
        },
      },
      { new: true }
    )
    res.json(coach)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/all-coaches", checkAdmin, async (req, res) => {
  const coach = await User.find({ role: "Coach" })
    .select("-__v -password")
    .populate("interview")
    .populate("appointments")
    .populate("ratings")
  res.json(coach)
})

router.delete("/:coachId", checkAdmin, validateId("coachId"), async (req, res) => {
  try {
    const coach = await User.findById(req.params.coachId)
    if (!coach) return res.status(404).send("coach not found")

    await Appointment.deleteMany({coachId:req.params.coachId})
    await Rating.deleteMany({coachId:req.params.coachId})
    await Message.deleteMany({coachId:req.params.coachId})
    await Comment.deleteMany({coachId:req.params.coachId})
    
    await User.findByIdAndRemove(req.params.coachId)
    res.send("coach removed")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/", checkUser, async (req, res) => {
  const coach = await User.find({ role: "Coach", interviewVerified: true }).select(
    "firstName lastName email avatar gender"
  )
  res.json(coach)
})

/*------------------------------------ interview --------------------------------------------------------*/

router.post("/:coachId/interview", checkInspector, validateId("coachId"), async (req, res) => {
  try {
    const { date } = req.body
    const result = interviewJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const coach = await User.findById(req.params.coachId)
    if (!coach) return res.status(404).send("coach not found")




    const newInterview = new Interview({
      date,
      inspectorId:req.userId,
    })
    
    
    await newInterview.save()

   await User.findByIdAndUpdate(
      req.params.coachId,
      { $set: { interview: newInterview }},
    {new:true} 
     
    )

   

    res.json(newInterview)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
router.get("/interview", checkInspector, async (req, res) => {
  const coach = await User.find({ role: "Coach", interviewVerified: undefined }).populate("interview")
  if (!coach) return res.status(404).send("coach is not found")
  res.json(coach)
})

router.get("/:coachId/interview", checkInspector, validateId("coachId"), async (req, res) => {
  const coach = await User.findById(req.params.coachId)
  if (!coach) return res.status(404).send("coach is not found")

  const interview = await Interview.find().select("-__v")
  res.json(interview)
})

router.put(
  "/:coachId/interview/:interviewId",
  checkInspector,
  validateId("coachId", "interviewId"),
  async (req, res) => {
    try {
      const { date } = req.body
      const coach = await User.findById(req.params.coachId)
      if (!coach) return res.status(404).send("coach is not found")

      const interview = await Interview.findById(req.params.interviewId)
      if (!interview) return res.status(404).send("interview is not found")
      const updatedInterview = await Interview.findByIdAndUpdate(
        req.params.interviewId,
        { $set: { date } },
        { new: true }
      )
      res.json(updatedInterview)
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
)

router.delete(
  "/:coachId/interview/:interviewId",
  checkInspector,
  validateId("coachId", "interviewId"),
  async (req, res) => {
    try {
      const coach = await User.findById(req.params.coachId)
      if (!coach) return res.status(404).send("coach is not found")

      const interview = await Interview.findById(req.params.interviewId)
      if (!interview) return res.status(404).send("interview is not found")

      await Interview.findOneAndRemove(req.params.interviewId)
      res.send("interview removed")
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
)

/*--------------------------------- edit interviewVerified --------------------------------------*/
router.put("/:coachId", checkInspector, validateId("coachId"), async (req, res) => {
  try {
    const { interviewVerified } = req.body
    const result = interviewVerifiedJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const coach = await User.findById(req.params.coachId)
    if (!coach) return res.status(404).send("coach is not found")

    const updatedCoach = await User.findByIdAndUpdate(
      req.params.coachId,
      {
        $set: {
          interviewVerified,
        },
      },
      { new: true }
    )
    res.json(updatedCoach)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

/*----------------------------------- Appointments --------------------------------------------------------*/
router.post("/:coachId/appointment", checkUser, validateId("coachId"), async (req, res) => {
  try {
    const { name} = req.body
    const result = appointmentJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const coach = await User.findById(req.params.coachId).populate("appointments")
    if (!coach) return res.status(404).send("coach not found")

    const newAppointment = new Appointment({
      name,
      userId: req.userId,
      coachId: req.params.coachId,
    })
    const appointmentFound =  coach.appointments.find(appointmentObject =>appointmentObject.userId == req.userId )
    if (appointmentFound)  return res.status(400).send("user already appointmented this coach")
    await newAppointment.save()

    await User.findByIdAndUpdate(req.params.coachId, { $push: { appointments: newAppointment } }, { new: true })

    await User.findByIdAndUpdate(req.userId, { $push: { appointments: newAppointment} }, { new: true })

    res.json(newAppointment)
  } catch (error) {
    res.status(500).send(error.message)
  }
})





router.get("/profile/appointment", checkCoach, async (req, res) => {
  const appointment = await Appointment.find({ coachId: req.userId }).populate("userId").select("-__v")
  res.json(appointment)
})

router.get("/profile/ratings", checkCoach, async (req, res) => {
  const rating = await Rating.find({ coachId: req.userId }).populate("userId").select("-__v")
  res.json(rating)
})

router.get("/profile/messages",checkCoach, async (req, res) => {
  const message = await Message.find({ coachId: req.userId }).populate("userId").populate("comments").select("-__v")
  res.json(message)
})

router.get("/profile/comments",checkUser, async (req, res) => {
  const comment = await Comment.find({ coachId: req.userId })
    .populate("userId")
    .select("-__v")
  res.json(comment)
})
// router.put(
//   "/:coachId/appointment/:appointmentId",
//   checkUser,
//   validateId("coachId", "appointmentId"),
//   async (req, res) => {
//     try {
//       const { name } = req.body

//       const result = appointmentEditJoi.validate(req.body)
//       if (result.error) return res.status(400).send(result.error.details[0].message)

//       const coach = await User.findById(req.params.coachId)
//       if (!coach) return res.status(404).send("coach is not found")

//       const appointment = await Appointment.findById(req.params.appointmentId)
//       if (!appointment) return res.status(404).send("appointment is not found")

//       const updatedAppointment = await Appointment.findByIdAndUpdate(
//         req.params.appointmentId,
//         { $set: { name } },
//         { new: true }
//       )
//       res.json(updatedAppointment)
//     } catch (error) {
//       res.status(500).send(error.message)
//     }
//   }
// )
router.delete(
  "/:coachId/appointment/:appointmentId",
  checkUser,
  validateId("coachId", "appointmentId"),
  async (req, res) => {
    try {
      const coach = await User.findById(req.params.coachId)
      if (!coach) return res.status(404).send("coach is not found")

      const appointment = await Appointment.findById(req.params.appointmentId)
      if (!appointment) return res.status(404).send("appointment is not found")

      await User.findByIdAndUpdate(
        req.params.coachId,
        { $set: { appointments: req.params.appointmentId } },
        { new: true }
      )
      await Appointment.findByIdAndRemove(req.params.appointmentId)
      res.send("appointment removed")
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
)

module.exports = router
