// Declare dependencies
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

// Initialize dotenv
dotenv.config()

// Initialize app
const app = express()
const port = process.env.PORT || 8000

// MongoDB connection

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.qk2mc8i.mongodb.net/booking-system-api?retryWrites=true&w=majority`, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})

let db = mongoose.connection

db.once('open', () => console.log("Connected to MongoDB"))

// MongoDB connection End

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// app start listening to requests
app.listen(port, () => console.log(`API is now running on localhost:${port}`))