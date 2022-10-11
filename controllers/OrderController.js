const Order = require('../models/Order')
const Product = require('../models/Product')
const mongoose = require('mongoose')

// -----need cleanup, function too big, may need to divide parts into smaller functions to improve readability
// a funtion to deduct amount to the inventory
// To create a new order
module.exports.createNewOrder  = async (user_id, order_details) => {

	// create a new order 
	const new_order = new Order({
		userId: user_id,
		product: {
			productId: order_details.product.productId,
			price: order_details.product.price,
			quantity: order_details.product.quantity
		},
		totalPrice: order_details.totalPrice,
		deliveryAddress: {
			houseNo: order_details.deliveryAddress.houseNo,
			streetName: order_details.deliveryAddress.streetName,
			city: order_details.deliveryAddress.city,
			province: order_details.deliveryAddress.province,
			country: order_details.deliveryAddress.country
		}
	})

	// Save new order to DB
	return new_order.save().then(saved_order => {
		if(saved_order !== null){
			return saved_order
		}

		return {
			message: "An unexpected error has occured!"
		}
	})

}

// To retrieve a users own orders
module.exports.getUserOrders = (user_id) => {
	// Retrieve all orders of this user -if order(s) is found: return result -else: return an error
		return Order.find({userId: user_id}).then(result => {
			if(result.length > 0){
				return result
			}

			return {
				message: "This user has no orders yet."
			}
		}).catch(error => {
			message: "Unknown error has occured!"
		})

} 

module.exports.getAllOrders = (isAdmin) => {
	if(isAdmin){
		return Order.find().then(result => {
			if(result.length > 0){
				return result
			}
			return {
				message: "No orders found."
			}
		})
	}

	return Promise.resolve({
		message: "Admin required!"
	})
}

