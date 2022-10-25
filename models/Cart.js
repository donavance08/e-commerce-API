const mongoose = require('mongoose')

const cart_schema = new mongoose.Schema({
		products: [{
			productId: mongoose.ObjectId,
			quantity: Number,
			subtotal: Number
		}],
		isActive: {
			type: Boolean,
			default: true
		},
		total: {
			type: Number,
			default: 0
		}
})

module.exports = mongoose.model("Cart", cart_schema)
