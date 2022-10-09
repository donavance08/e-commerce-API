const mongoose = require('mongoose')

const order_schema  = new mongoose.Schema({
	userId: {
		type: String,
		required: true
	},
	products: [{
		productId: {
			type: String,
			required: true
		},
		quantity: {
			type: Number, 
			min: 1,
			required: true
		}
		
	}],
	totalAmount: {
		type: Number,
		required: true
	},
	purchasedOn:{
		type: Date,
		default: new Date()
	}, 
	status: {
		type: String,
		// Pending - Order pending confirmation from suppliers
		// Rejected - Order was rejected for reasons natural reasons
		// Ready for Dispatch - Order is ready to be sent to customer
		// Dispatched - Order is out for delivery
		// Delivered - Order has been delivered
		// Closed - Order has been completed.
		// Archived - Order has been completed for more than 365 days and is now archived
		enum: ["Pending", "Rejected" , "Ready for Dispatch", "Dispatched", "Delivered", "Closed", "Archived"],
		default: "Pending"
	},
	deliveryAddress: {
		houseNo: Number,
		streetName: String,
		city: String,
		province: String,
		country: {
			type: String,
			default: "Philippines"
		}
	}
})

module.exports = mongoose.model("Order", order_schema)