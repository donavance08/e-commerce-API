const mongoose = require('mongoose')

const contact_schema = new mongoose.Schema({
	type: {
		type: String,
		default: "Cellphone"
	},
	number: {
		type: String
	}
})

const user_schema = new mongoose.Schema({
	firstName: {
		type: String,
		required: [true, "First Name is required."],
		lowercase: true
	},
	lastName: {
		type: String,
		required: [true, "Last Name is required."],
		lowercase: true
	},
	email: {
		type: String,
		required: [true, "Email is required."],
		lowercase: true
	},
	contactNo: {
		type: [contact_schema],
		required: [true, "At least 1 contact number is required."]	
	},
	password: {
		type:String,
		required: [true, "Password is required."]
	},
	isAdmin: {
		type: Boolean,
		default: false
	}, 
	registrationDate: {
		type: Date,
		default: new Date()
	}
})



module.exports = mongoose.model("User", user_schema)