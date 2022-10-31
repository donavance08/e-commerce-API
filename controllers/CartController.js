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
		return {
			success: true,
			product: product
		}
	}).catch(error => {
		return{
			success: false,
		} 
	})
}


// To increment or decrement an item from the cart - item must be in the cart -- if not, it will return and error message
module.exports.incrementOrDecrementQuantity = async (cart_id, product_id, operator) => {

  	// verify that we are using correct operator
	if(operator	!== "+" && operator !== "-"){
		return Promise.resolve({
				message: "Incorrect operator"
		})
	}

	const cart = await Cart.findOne({_id: cart_id}).then(cart => {
		return cart
	})

	const product_price = await ProductController.getSingleProduct(product_id, {price:1, _id: 0}).then(result => {
				return result.success? result.product.price : 0
	})

	let modified_product = {}
	const cart_contents = await cart.products.map(product=> {

		if(product.productId.toString() === product_id){

			if(operator === "+"){
				product.quantity++
				product.subtotal += product_price
				cart.total += product_price
			} else {
				product.quantity--
				product.subtotal -= product_price
				cart.total -= product_price
			}

			modified_product = product
		}
		
		return product
	}).filter(product => product.quantity > 0)
	cart.products = cart_contents

	return cart.save().then(result => {
		return modified_product
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
		return cart.save().then(result => {
			return {success: true,
				result: result
			}	

		});
	}
		
		// if to_remove is not an array
	const cart = await Cart.findOne({_id: cart_id}).then(result => result)

		// Save contents of cart to variable
		let { products } = cart
		let total_item_price
		let item_found = false

		// Loop through cart contents to find item to be deleted
	for(let i = 0; i < products.length; i++){
		// Once found proceed to delete
		if(products[i].productId.equals(to_remove)){
			total_item_price = products[i].subtotal
			products.splice(i, 1)
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
	cart.total -= total_item_price
	// Save the updated cart 
	return cart.save().then(updated_cart => {
		if(updated_cart !== null){
			return updated_cart
		}

		return {
			message: "An unexpected error has occured!"
		}
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

	// extracting product details saved from the cart
	const { products } = user_cart

	// retrieve the users address from the user db
	let	user_address = await  User.findOne({_id: user.id}).then(user => {
		return user.address
	})


	// check if the cart is not empty before processing the order
	if(products.length > 0){


		// verify that the inventory still has enough items for the order of the customer and cancel the checkout if NOT
		for(let i = 0; i < products.length; i++){
			const result = await ProductController.isEnoughQuantity(products[i].quantity, products[i].productId)
			if(result.success){
				continue
			}

			return {
				success: false,
				name: result.name
			}

		}

		// Pulling up the rest of the product information from the products DB to save on the order DB
		const final_products = []

		// using for loop to await the updated product details
		for(let i = 0; i < products.length; i++){

			const addtl_details = await ProductController.getSingleProduct(products[i].productId).then(product_info_from_db => {
				return product_info_from_db
			})

			const updated_product_details = {
				productId: products[i].productId,
				quantity: products[i].quantity,
				subtotal: products[i].subtotal,
				imageLink: addtl_details.product.imageLink,
				name: addtl_details.product.name,
				price: addtl_details.product.price
			}

			final_products.push(updated_product_details)

		}

		// extracting the subtotals of each item for calculation of the actual total amount
		const subtotals =  products.map(product_info => product_info.subtotal)

		// Saving the order details to a variable that will be passed on to the OrderController that will process the actual order creation
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

		// Calling this function in order to modify the Products DB and deduct the quantity
		products.forEach(product => {
			ProductController.updateProductQuantity(product.productId, product.quantity)
		})	


		return {
			success: true,
			orders: saved_order
		}

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