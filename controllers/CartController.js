const Cart = require('../models/Cart')

// To add an item to user cart
module.exports.addToCart = (cartId, data) => {

	// First locate the users cart 
	return Cart.findOne({_id: cartId}).then(result => {
		// Once cart is found - retrieve old contents and save to variable
		if(result !== null){
			let storedProducts = result.products
			let isFound = false

			// Loop through cart contents to see if the product to be added already exists
			// If it exists, proceed to increment its quantity by the quantity of the input
			for(let i = 0; i < storedProducts.length; i++){
				if(storedProducts[i].productId === data.productId){
					storedProducts[i].quantity += data.quantity
					isFound = true
					break
				}
			
			}

			// If the product is not yet on the list - proceed to add it
			if(!isFound){
				storedProducts.push(data)
			}

			// Add the total value of the added product to the totalAmount
			result.totalAmount += data.price * data.quantity
			// replace the products content with the updated variable
			result.products = storedProducts
			// Save the new updated result
			return result.save().then(saved_cart => {
				if(saved_cart !== null){
					return saved_cart
				}

				return{ 
					message: "Unknown error has occured"
				}
			})

		}

		return {
			message: "Cannot find cartId"
		}
	})
}