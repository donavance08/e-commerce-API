const Cart = require('../models/Cart')
const User = require('../models/User')
const Order = require('../models/Order')
const Product = require('../models/Product')
const mongoose = require('mongoose')
const ProductController = require('./ProductController')
const OrderController = require	('./OrderController')

function isQuantityEnough(product_quantity, quantity){
	return product_quantity >= quantity
}

function findActiveCart(cart_id){
	return Cart.findOne({_id: cart_id}).then(result => {
		if(result.isActive){
			return {
				success: true,
				cart: result
			}
		}

		return {
			success: false,
			error: "Cart is disabled for this Id"
		}

	}).catch(error => {
		return {
			success: false,
			error: "Cannot find cart!"
		}
	})
}

module.exports.addToCart = async (user, product_id) => {
	
	if(user.accessType != "user" || user.isAdmin){
		return Promise.resolve({
			success: false,
			error: "Unable to use cart!"
		})
	}

	const cart = await findActiveCart(user.cartId).then(result => {
		if(result.success){
			return result.cart
		}

		return null
	})

	const product = await ProductController.getSingleProduct(product_id).then(result => {
		if(result.success){
			return result.product
		}

		return null
	})

	const product_ids = cart.products.map(product => product.productId.toString())
	const index = product_ids.indexOf(product_id);
	
	if(index !== -1){
		cart.products[index].quantity += 1
		cart.products[index].subtotal += product.price
		cart.total += product.price
	} else {
		cart.products.push({
			productId: product.id,
			quantity: 1,
			subtotal: product.price
		})
		cart.total += product.price
	}
		
	return cart.save().then(result => {
		return true
	}).catch(error => {
		return false
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
module.exports.removeItem = async (cart_id, to_remove) => {

	// if to_remove is an array, remove the items by the array value
	if(Array.isArray(to_remove)){
	
		const cart = await Cart.findOne({_id: cart_id}).then(result => result)
		
		for(let i = 0; i<to_remove.length; i++){
			const product_ids = cart.products.map(product => product.productId.toString())
			const index = product_ids.indexOf(to_remove[i].toString())
			cart.total -= cart.products[index].subtotal	
			cart.products.splice(index, 1)
		}
		return cart.save().then(result => result);
	}
		
		// if to_remove is not an array
		return Cart.findOne({_id: cart_id}).then(result => {
		// Save contents of cart to variable
		let { stored_products }= result
		let total_item_price
		let item_found = false

		// Loop through cart contents to find item to be deleted
		for(let i = 0; i < stored_products.length; i++){
			// Once found proceed to delete
			if(stored_products[i].productId.equals(to_remove)){
				console.log(true);
				total_item_price = stored_products[i].subtotal
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
		result.total -= total_item_price
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
		return Promise.resolve({
			success: false,
			message: "Admin cannot checkout an order."
		})
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

	
	const { products } = user_cart

	let	user_address = await  User.findOne({_id: user.id}).then(user => {
		return user.address
	})

	if(products.length > 0){

		const final_products = products.map(product_info => {
			product_info.price =  ProductController.getSingleProduct(product_info.id).then(product_info_from_db => {
				return product_info_from_db.price
			})

			return product_info
		})

		const subtotals =  products.map(product_info => product_info.subtotal)

		const order_details = {
			userId: user.id,
			products: final_products,
			totalPrice: subtotals.reduce((prev, curr) => prev + curr, 0),
			deliveryAddress: {
			houseNo: address.houseNo || user_address.houseNo,
			streetName: address.streetName || user_address.streetName,
			city: address.city || user_address.city,
			province: address.province || user_address.province,
			country: address.country || user_address.country,
			zip: address.zip || user_address.zip
			}
		}


		const saved_order = await OrderController.createNewOrder(user.id, order_details)
		
		const products_for_removal = products.map(product => product.productId)
		// Call this.removeItem to remove the item from the cart DB
		this.removeItem(user.cartId,products_for_removal).then(result => {
			return result
		})
	
		return {
			success: true,
			orders: saved_order
		}

		// let created_orders = []

		// for(let i =0 ; i < products.length; i++){

		// 	// retrieve product in database
		// 	let product = await Product.findOne({_id: products[i].productId}).then(result => {
		// 		if(result !== null){
		// 			return result
		// 		}
		// 	})

		// 	// Check quantity and return error if no longer have enough in inventory
		// 	if(product.quantity < products[i].quantity){
		// 		created_orders.push({
		// 			message: `${product.name} is no longer avaialable` 
		// 		})

		// 		continue
		// 	}

		// 	// create a new order
		// 	const new_order = new Order({
		// 		userId: user.id,
		// 		product: {
		// 			productId: products[i].productId,
		// 			price: products[i].price,
		// 			quantity: products[i].quantity
		// 		},
		// 		totalPrice: products[i].subtotal,
		// 		deliveryAddress: {
		// 			houseNo: address.houseNo || user_address.houseNo,
		// 			streetName: address.streetName || user_address.streetName,
		// 			city: address.city || user_address.city,
		// 			province: address.province || user_address.province,
		// 			country: address.country || user_address.country,
		// 			zip: address.zip || user_address.zip
		// 		}
		// 	})

		// 	// Save the order to DB
		// 	let created_order = await 




		// 	product.quantity -= products[i].quantity
		// 	product.save().then(updated_product => {
		// 		updated_product 
		// 	})

		// 	// save order details
		// 	created_orders.push(created_order)

		// }

		// // return order details
		// return {
		// 	success: true,
		// 	orders: created_orders
		// }
	}

	return Promise.resolve({
		success: false,
		message: "Cart is empty!"
	})
}

// To get cart contents
module.exports.getCartContents = (user) => {
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