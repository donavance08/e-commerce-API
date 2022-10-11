const mongoose = require('mongoose')

// schema for use of the review property
const review_schema = new mongoose.Schema({
	userId: mongoose.ObjectId,
	review: String,
	stars: {
		type: Number,
		min: 1,
		max: 5
	}
})

//schema of each product in the inventory
const product_schema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Product name is required."]
	},
	category: {
		type: String,
		default: "none"
	},
	brandName: {
		type: String, 
		default: "none"
	},
	description: {
		type: String,
		required: [true, "Description is required"]
	},
	price: {
		type: Number,
		required: [true, "Price is required"]
	},
	currency: {
		type: String,
		default: "PHP"
	},
	quantity: {
		type: Number,
		default: 1
	},
	manufacturer: {
		type: String,
		required: [true, "Manufacturer is required"]
	},
	isActive: {
		type: Boolean,
		default: true
	},
	starsRating: {
		type: Number,
		min: 0,
		max: 5,
		default: 0
	}, 
	reviews: [review_schema],
	createdOn: {
		type: Date,
		default: new Date()
	}
})





module.exports = mongoose.model("Product", product_schema)