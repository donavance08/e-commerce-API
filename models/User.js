const mongoose = require('mongoose')

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
		lowercase: true,
		index: true
	},
	contactNo: {
		type: [{
			type: {
				type: String,
				default: "Cellphone"
			},
			number: {
				type: String
			}
		}],
		required: [true, "At least 1 contact number is required."]	
	},
	password: {
		type:String,
		required: [true, "Password is required."]
	},
	accessType: {
		type: String,
		enum: ["user", "vendor", "courier"],
		default: "user",
		index: true
	}, 
	isAdmin: {
		type: Boolean,
		default: false
	},
	registrationDate: {
		type: Date,
		default: new Date()
	},
	address :{
		houseNo: Number,
		streetName: String,
		city: String,
		province: String,
		country: {
			type: String,
			default: "Philippines"
		},
		zip: Number
	},
	isActive: {
		type: Boolean,
		default: true
	},
	cartId: mongoose.ObjectId

})

module.exports = mongoose.model("User", user_schema)