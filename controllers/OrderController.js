const Order = require('../models/Order')
const Product = require('../models/Product')
const mongoose = require('mongoose')
const Hash = require('../Hash.js')

// -----need cleanup, function too big, may need to divide parts into smaller functions to improve readability
// a funtion to deduct amount to the inventory
// To create a new order
module.exports.createNewOrder  = async (user, order_details) => {

	const order_id = Hash.generateOrderNumber(order_details.userId);

	// create a new order
	const new_order = new Order({
		orderId: order_id,
		userId: order_details.userId,
		products: order_details.products,
		totalPrice: order_details.totalPrice,
		deliveryAddress: {
			houseNo: order_details.deliveryAddress.houseNo,
			streetName: order_details.deliveryAddress.streetName,
			city: order_details.deliveryAddress.city,
			province: order_details.deliveryAddress.province,
			country: order_details.deliveryAddress.country,
			zip: order_details.deliveryAddress.zip
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
				return{
					success: true,
					orders: result
				}	
			}

			return {
				success: false,
				message: "This user has no orders yet."
			}
		}).catch(error => {
			return {
				sucess: false,
				message: "Unknown error has occured!"
			}
		
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

module.exports.getOrderById = (user, order_id) => {
	return Order.findOne({_id: order_id}).then(order => {
		if(order !== null){
			if(user.id == order.userId || user.isAdmin){
				return order
			}

			return {
				message: "Order does not belong to user!"
			}
		}

		return {
			message: "Order not found!"
		}
	})
}

module.exports.cancelOrder = async (user, order_id) => {
	let order = await this.getOrderById(user, order_id).then(ordered => {
		return ordered
	})

	if(order.message === undefined){
		order.status = "cancelled"
		return order.save().then(updated_order => {
			return updated_order
		})
	}

	return order
}