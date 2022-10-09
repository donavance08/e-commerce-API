const Order = require('../models/Order')
const Product = require('../models/Product')
const mongoose = require('mongoose')

// -----need cleanup, function too big, may need to divide parts into smaller functions to improve readability
// a funtion to deduct amount to the inventory
// To create a new order
module.exports.createNewOrder  = async (user_id, details) => {
	// function to calculate the total amount of the orders

	const total_amount =  async (details) => {

		// Check if there is at least 1 product_id
		if(details.products.length > 0) {
			let sub_total = 0

			// Loop through all products to retrieve their prices and return the total
			for(let i = 0; i < details.products.length; i++){
				const product_price = await Product.findById(details.products[i].productId)
				.then((product_found) => {
					if(product_found !==null){
						return product_found.price
					}

					return 0
				}).catch((error) => {
					return 0
				})

				sub_total += product_price * details.products[i].quantity
			}

			return sub_total
		}

	}

	// Create the order
	const new_order = new Order({
		userId: user_id,
		products: details.products,
		// Run the function to compute the totalPrice
		totalAmount: await total_amount(details),
		deliveryAddress: details.deliveryAddress
	})

	// Save the order, successfull = Checkout successfull, failure = Checkout failed
	return new_order.save().then((saved_order) => {
		if(saved_order !== null){
			return {
				message: "Checkout successfull.",
				Orders: saved_order
			}
		}

		return {
			message: "Checkout failed!"
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

