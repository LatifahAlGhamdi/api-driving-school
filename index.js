const mongoose = require("mongoose")
const express = require("express")
require("dotenv").config()
const Joi = require("joi")
const JoiObjectId = require("joi-objectid")
Joi.objectid = JoiObjectId(Joi)
const users = require("./routes/users")
const inspectors = require("./routes/inspectors")
const coaches = require("./routes/coaches")
const cors = require("cors")
mongoose
  .connect(`mongodb+srv://Latifah000:${process.env.MONGODB_PASSWORD}@cluster0.ahz0n.mongodb.net/finalProjectDB?retryWrites=true&w=majority`)
  .then(() => console.log("connected MongoDB"))
  .catch(error => console.log("Error to conncted MongoDB", error))

const app = express()
app.use(express.json())
app.use(cors())
app.use("/api/auth", users)
app.use("/api/inspectors", inspectors)
app.use("/api/coaches", coaches)
const port = 5000

app.listen(process.env.PORT || port, () => {
  console.log("Server is listening on port", port)
})
