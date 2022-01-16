const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const checkAdmin = require("../middleware/checkAdmin")
const validateId = require("../middleware/validateId")
const checkInspector = require("../middleware/checkInspector")
const { User, profileEditJoi, signUpJoi } = require("../models/User")

router.post("/add-inspector", checkAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar, gender, mobileNumber, anotherMobileNumber } = req.body
    const result = signUpJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).send("inspector already reqistered")

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
      role: "Inspector",
    })
    await user.save()
    delete user._doc.password
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/profile", checkInspector, async (req, res) => {
  try {
    const inspector = await User.findById(req.userId).select("-__v -password")
    res.json(inspector)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// router.put("/profile", checkInspector, async (req, res) => {
//   try {
//     const { firstName, lastName, avatar, gender, mobileNumber, anotherMobileNumber } = req.body
//     const result = profileEditJoi.validate(req.body)
//     if (result.error) return res.status(400).send(result.error.details[0].message)

//     const inspector = await User.findByIdAndUpdate(
//       req.userId,
//       { $set: { firstName, lastName, avatar, gender, mobileNumber, anotherMobileNumber } },
//       { new: true }
//     )
//     res.json(inspector)
//   } catch (error) {
//     res.status(500).send(error.message)
//   }
// })

router.get("/", checkAdmin, async (req, res) => {
  const inspector = await User.find({ role: "Inspector" }).select("-__v -password")
  res.json(inspector)
})

router.delete("/:inspectorId", checkAdmin, validateId("inspectorId"), async (req, res) => {
  try {
    const inspector = await User.findById(req.params.inspectorId)
    if (!inspector) return res.status(404).send("inspector not found")
    await User.findByIdAndRemove(req.params.inspectorId)
    res.send("inspector removed")
  } catch (error) {
    res.status(500).send(error.message)
  }
})
module.exports = router
