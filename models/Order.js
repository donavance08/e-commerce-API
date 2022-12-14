const mongoose = require('mongoose')

const order_schema  = new mongoose.Schema({
	orderId: String,
	userId: {
		type: mongoose.ObjectId,
		required: true
	},
	products: [{
		productId: {
			type: mongoose.ObjectId,
			required: true
		},
		name: String,
		price: Number,
		imageLink: String,
		quantity: {
			type: Number, 
			min: 0,
			required: true
		},
		subtotal: {
			type: Number,
			default: 0
		}

		
	}],
	totalPrice: {
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
		enum: ["pending", "rejected" , "cancelled", "ready for dispatch", "dispatched", "delivered", "declined", "closed", "archived"],
		default: "pending"
	},
	deliveryAddress: {
		houseNo: Number,
		streetName: String,
		city: String,
		province: String,
		country: {
			type: String,
			default: "Philippines"
		},
		zip: Number
	}
})

module.exports = mongoose.model("Order", order_schema)