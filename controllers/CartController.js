const Cart = require('../models/Cart')
const User = require('../models/User')
const Order = require('../models/Order')
const Product = require('../models/Product')
const mongoose = require('mongoose')

// To add an item to user cart or increase quantity of a product on the cart
// Need optimisation - get data from database not from user input
// only data from user will be quantity and id
module.exports.addToCart = (user, new_product) => {
	if(user.isAdmin){
		return Promise.resolve({
			message: "Admin cannot use add to cart"
		})
	}

	// First locate the users cart 
	return Cart.findOne({_id: user.cartId}).then(result => {
		// Once cart is found - retrieve old contents and save to variable
		if(result !== null){
			let stored_products = result.products
			let isFound = false

			// Loop through cart contents to see if the product to be added already exists
			// If it exists, proceed to increment its quantity by the quantity of the input
			for(let i = 0; i < stored_products.length; i++){
				if(stored_products[i].productId.equals(new_product.productId)){
					stored_products[i].quantity += new_product.quantity
					stored_products[i].subtotal += new_product.quantity * new_product.price
					isFound = true
					break
				}
			
			}

			// If the product is not yet on the list - proceed to add it
			if(!isFound){
				new_product.subtotal = new_product.quantity * new_product.price
				stored_products.push(new_product)
			}

			// Add the total value of the added product to the totalAmount
			result.totalAmount += new_product.price * new_product.quantity
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
			message: "Cannot find cart"
		}
	})
}

// To increment or decrement an item from the cart - item must be in the cart -- if not, it will return and error message
module.exports.incrementOrDecrementQuantity = (cart_id, product_id, operator) => {

  	// verify operator falls between + or -
	if(operator	!== "+" && operator !== "-"){
		return Promise.resolve({
				message: "Incorrect operator"
		})
	}

	// Locate the users cart
	return Cart.findOne({_id: cart_id}).then(cart => {
		// If cart is found proceed to save its contents to a variable
		if(cart === null){
			return {
				message: "Cannot find cart"
			}
		}

		let stored_products = cart.products
		let item_found = false

		// loop through the cart contents to find the product
		for(let i = 0; i < stored_products.length; i++){
			// If found update the details accordingly
			if(stored_products[i].productId.equals(product_id)){

				if(operator === "+"){
					stored_products[i].quantity++
					stored_products[i].subtotal += stored_products[i].price
					cart.totalAmount += stored_products[i].price
				}
				
				if(operator === "-"){
					stored_products[i].quantity--
					stored_products[i].subtotal -= stored_products[i].price
					cart.totalAmount -= stored_products[i].price
				}
					
				item_found = true
				break
			}
		}	

		// If not found then return an error
		if(!item_found){
			return {
				message: "Item not found in cart. Please use addToCart first"
			}
		}

		cart.products = stored_products

		// Save updated the cart to DB
		return cart.save().then(saved_cart => {
			if(saved_cart !== null){
				return saved_cart
			}

			return{ 
				message: "An unknown error has occured"
			}
		})
	})	
}

// To remove an item from the cart
module.exports.removeItem = (cart_id, for_removal_id) => {
	// Located users cart
	return Cart.findOne({_id: cart_id}).then(result => {
		// Save contents of cart to variable
		let stored_products = result.products
		let total_item_price
		let item_found = false

		// Loop through cart contents to find item to be deleted
		for(let i = 0; i < stored_products.length; i++){
			// Once found proceed to delete
			if(stored_products[i].productId.equals(for_removal_id)){
				total_item_price = stored_products[i].price * stored_products[i].quantity
				stored_products.splice(i, 1)
				item_found = true
				break
			}
		}

		// If item is not found, don't make any changes
		if(!item_found){
			return {
				message: "Item not in cart!"
			}
		}

		// Update new totalAmount
		result.totalAmount -= total_item_price
		// Save the updated cart 
		return result.save().then(updated_cart => {
			if(updated_cart !== null){
				return updated_cart
			}

			return {
				message: "An unexpected error has occured!"
			}
		})
	})
}

// To checkout 
module.exports.checkout = async (user, address) => {
	// only non admin can order
	if(user.isAdmin){
		return {
			message: "Admin cannot checkout an order."
		}
	}

	// retrieve card contents
	const user_cart = await Cart.findOne({_id: user.cartId},).then(cart => {
		if(cart === null){
			return {
				message: "Unable to load cart!"
			}
		}

		return cart
	})

	const products = user_cart.products

	let	user_address = await  User.findOne({_id: user.id}).then(user => {
		return user.address
	})


	// console.log(products);

	if(products.length > 0){

		let created_orders = []

		for(let i =0 ; i < products.length; i++){

			// retrieve product in database
			let product = await Product.findOne({_id: products[i].productId}).then(result => {
				if(result !== null){
					return result
				}
			})

			// Check quantity and return error if no longer have enough in inventory
			if(product.quantity < products[i].quantity){
				created_orders.push({
					message: `${product.name} is no longer avaialable` 
				})

				continue
			}

			// create a new order
			const new_order = new Order({
				userId: user.id,
				product: {
					productId: products[i].productId,
					price: products[i].price,
					quantity: products[i].quantity
				},
				totalPrice: products[i].subtotal,
				deliveryAddress: {
					houseNo: address.houseNo || user_address.houseNo,
					streetName: address.streetName || user_address.streetName,
					city: address.city || user_address.city,
					province: address.province || user_address.province,
					country: address.country || user_address.country,
					zip: address.zip || user_address.zip
				}
			})

			// Save the order to DB
			let created_order = await new_order.save().then(result=>{
				return result
			})

			// Call this.removeItem to remove the item from the cart DB
			this.removeItem(user.cartId,products[i].productId).then(result => {
				return result
			})


			product.quantity -= products[i].quantity
			product.save().then(update_product => {
				update_product 
			})

			// save order details
			created_orders.push(created_order)

		}

		// return order details
		return created_orders
	}

	return {
		message: "Cart is empty!"
	}
}

// To get cart contents
module.exports.getCart = (user) => {
	return Cart.findOne({_id: user.cartId}).then(cart => {
		if(cart !== null){
			return cart
		}

		return {
			message: "An unexpected error has occured. Please try again!"
		}
	})
}

// To get a cart by admin user
module.exports.adminGetCart = (user, cart_id) => {
	if(!user.isAdmin){
		return	Promise.resolve({
			message: "User must be admin to get other users cart information"
		})
	}

	return Cart.findOne({_id: cart_id}).then(cart => {
		if(cart !== null){
			return cart
		}

		return {
			message: "Cannot find cart!"
		}
	})

}