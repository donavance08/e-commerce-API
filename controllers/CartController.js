const Cart = require('../models/Cart')
const mongoose = require('mongoose')

// To add an item to user cart or increase quantity of a product on the cart
module.exports.addToCart = (cartId, data) => {

	// First locate the users cart 
	return Cart.findOne({_id: cartId}).then(result => {
		// Once cart is found - retrieve old contents and save to variable
		if(result !== null){
			let stored_products = result.products
			let isFound = false

			// Loop through cart contents to see if the product to be added already exists
			// If it exists, proceed to increment its quantity by the quantity of the input
			for(let i = 0; i < stored_products.length; i++){
				if(stored_products[i].productId.equals(data.productId)){
					stored_products[i].quantity += data.quantity
					isFound = true
					break
				}
			
			}

			// If the product is not yet on the list - proceed to add it
			if(!isFound){
				stored_products.push(data)
			}

			// Add the total value of the added product to the totalAmount
			result.totalAmount += data.price * data.quantity
			// replace the products content with the updated variable
			result.products = stored_products
			// Save the new updated result
			return result.save().then(saved_cart => {
				if(saved_cart !== null){
					return saved_cart
				}

				return{ 
					message: "An unknown error has occured"
				}
			})

		}

		return {
			message: "Cannot find cartId"
		}
	})
}

module.exports.removeFromCart = (cart_id, product_id) => {
	return Cart.findOne({_id: cart_id}).then(result => {
		if(result !== null){
			let stored_products = result.products
			let is_found = false
			let price = 0

			for(let i = 0; i < stored_products.length; i++){
				if(stored_products[i].productId.equals(product_id)){
					console.log("is equals");
					stored_products[i].quantity--
					is_found = true
					price = stored_products[i].price
					break
				}
			}

			if(!is_found){
				return {
					message: "Product not found in the list"
				}
			}

			result.totalAmount -= price
			result.products = stored_products

			return result.save().then(saved_cart => {
				if(saved_cart !== null){
					return saved_cart
				}

				return{ 
					message: "An unknown error has occured"
				}
			})

		}

		return {
			message: "Cannot find cart"
		}
	})
}