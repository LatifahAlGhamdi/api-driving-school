const mongoose = require("mongoose")
const { User } = require("../models/User")
const jwt = require("jsonwebtoken")

const checkCoach = async (req, res, next) => {
  try {
    const token = req.header("Authorization")
    if (!token) return res.status(401).send("token is missing")
    const decryptedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const coachId = decryptedToken.id

    const coachFound = await User.findById(coachId)
    if (!coachFound) return res.status(404).send("coach not found")

    if (coachFound.role !== "Coach") return res.status(403).send("you are not coach")
    if (coachFound.interviewVerified !== true) return res.status(403).send("you are an uncertified trainer")
    req.userId = coachId
    next()
  } catch (error) {
    res.status(500).send(error.message)
  }
}

module.exports = checkCoach
