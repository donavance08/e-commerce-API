const mongoose = require('mongoose')

//schema of each product in the inventory
const product_schema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Product name is required."],
		index: true
	},
	category: {
		type: Array,
		index: true
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
		required: [true, "Price is required"],
		index: true
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
	vendorId:{ 
		type: mongoose.ObjectId,
		index: true
	},
	isActive: {
		type: Boolean,
		default: true
	},
	starsRating: {
		type: Number,
		min: 0,
		max: 5,
		default: 0,
		index: true
	}, 
	reviews: [{
		userId: mongoose.ObjectId,
		review: String,
		stars: {
			type: Number,
			min: 1,
			max: 5
		}
	}],
	createdOn: {
		type: Date,
		default: new Date()
	}
})





module.exports = mongoose.model("Product", product_schema)