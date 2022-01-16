const mongoose = require("mongoose")
const { User } = require("../models/User")
const jwt = require("jsonwebtoken")

const checkInspector = async (req, res, next) => {
  try {
    const token = req.header("Authorization")
    if (!token) return res.status(401).send("token is missing")
    const decryptedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const inspectorId = decryptedToken.id

    const inspectorFound = await User.findById(inspectorId)
    if (!inspectorFound) return res.status(404).send("user not found")

    if (inspectorFound.role !== "Inspector") return res.status(403).send("you are not inspector")
    req.userId = inspectorId
    next()
  } catch (error) {
    res.status(500).send(error.message)
  }
}

module.exports = checkInspector
