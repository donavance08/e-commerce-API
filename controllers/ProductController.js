const Product = require('../models/Product')
const mongoose = require('mongoose')

// To add a new product(admin only)
module.exports.createProduct = (data) => {

	// Check if data is admin - else send an error message
	if(data.isAdmin){
		// if user is admin - generate a product from input data
		let new_product = new Product({
			name: data.product.name,
			category: data.product.category,
			brandName: data.product.brandName,
			manufacturer: data.product.manufacturer,
			description: data.product.description,
			price: data.product.price,
			quantity: data.product.quantity
		})

		// Save the new product into the DB - return a message for success or failure
		return new_product.save().then((saved_product) => {
			if(saved_product !== null){
				return {
					message: "New product successfully added."
				}
			}

			return {
				message: "Failed to add new product!"
			}
		})
	}
		
	let message = Promise.resolve({
		message: 'User must be ADMIN to add a product.'
	})

	return message.then((value)=> {
		return value
	}) 
} 

// -----need further testing for non active products
// To filter all active products
module.exports.getAllActiveProducts = () => {
	return Product.find({isActive: true}, {isActive: 0, createdOn: 0, reviews: 0}).then((products) => {
		if(products.length > 0){
			return products
		}

		return {
			message: "No products available"
		}
	})
}

// To retrieve a single product based on its Id
// -- return product if found
// -- return "Product not found" if product cannot be found
// -- return Product Id invalid if user entered an invalid product Id. eg. adding special characters or length > _id length
module.exports.getSingleProduct = (product_id) => {
	return Product.findById(product_id).then((product) => {
			if(product !== null){
				return product
			}

			return {
				message: "Product not found!"
			}
	
			// return product
	}).catch(error => {
		console.log(error)
		return {
			message: "Product ID invalid."
		}
	})
}

// To update properties of a single product
module.exports.updateSingleProduct = (data) => {
	if(data.isAdmin){
		return Product.findByIdAndUpdate(data.id, {
			name: data.updates.name,
			category: data.updates.category,
			brandName: data.updates.brandName,
			manufacturer: data.updates.manufacturer,
			description: data.updates.description,
			price: data.updates.price
		}).then((updated_product) => {
			if(updated_product !== null){
				return {
					message: "Product update successfull",
					product: updated_product
				}
			}

			return {
				message: "Something went wrong. Cannot update product!"
			}
		}).catch((error) => {
			console.log(error);
			return {
				message: "Invalid product ID!"
			}
		})

	}

	return Promise.resolve({
		message: "User must be an admin to update!"
	})
}

// To archive a product
module.exports.archiveSingleProduct = (product_id, isAdmin) => {
	// Verify if admin - return and error it not
	if(isAdmin){
		// Find product by id and update isActive to false and return a message for success or failure
		return Product.findByIdAndUpdate(product_id, {
			isActive: false
		}).then((updated_product) => {
			if(updated_product !== null){
				return {
					message: "Product successfully archived."
				}
			}

			return {
				message: "Unable to find product."
			}
		}).catch((error) => {
			console.log(error)
			return {
				message: "Invalid product Id."
			}
		})
	}

	return Promise.resolve({
		message: "User must be an admin to archive a product!"
	})
}

// To add a review for a product
module.exports.createReview = async (user_details, product_id, review) => {
	// Admin cannot leave a review
	if(user_details.isAdmin === true){
		return {
			message: "Admin cannot leave a review."
		}
	}
	// First locate the product and return error if not found
	let product =  await Product.findOne({_id: product_id}).then(product_found => {
		if(product_found !== null){
			return product_found
		}

		return null
	})

	// Cannot leave review for archived products
	if(!product.isActive){
		return {
			message: "Product no longer active!"
		}
	}
	// Once product is found proceed to add the review and calculate the average start rating
	console.log(user_details.id);
	if(product !== null){
		// let user_review = new mongoose.Schema({
		// 	userId: mongoose.ObjectId(user_details.id),
		// 	review: review.review,
		// 	stars: review.stars
		// })

		review["userId"] = {}
		review.userId = user_details.id
		product.reviews.push(review)
		let stars = 0

		for(let i = 0; i < product.reviews.length; i++){
			stars += product.reviews[i].stars
		}

		product.starsRating = stars / product.reviews.length
		return product.save().then(result => {
			return result
		})
	}

	return {
		message: "Product not found!"
	}
}
