const mongoose = require('mongoose')

const cart_schema = new mongoose.Schema({
		products: [{
			productId: mongoose.ObjectId,
			price: Number,
			quantity: Number,
			subtotal: Number
		}],
		totalAmount: {
			type: Number,
			default: 0
		},
		isActive: {
			type: Boolean,
			default: true
		}
})

module.exports = mongoose.model("Cart", cart_schema)
