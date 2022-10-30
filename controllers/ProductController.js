const Product = require('../models/Product')
const mongoose = require('mongoose')
const User = require('../models/User')

// Vendor method to add a product 
module.exports.addProduct = async (vendor_id, product) => {
	const vendor = await User.findOne({_id: vendor_id}, {accessType: 1}).then(result => {
		if(result !== null){
			return {
				success: true,
				result: result
			} 
		}

		return {
			success: false
		}
	})

	if(vendor.result.accessType !== "vendor"){
		return 
	}

	let new_product = new Product({
		name: product.name,
		category: product.category,
		brandName: product.brandName,
		description: product.description,
		imageLink: product.imageLink,
		price: product.price,
		quantity: product.quantity,
		manufacturer: product.manufacturer,
		vendorId: vendor_id,

	})

	return new_product.save().then(result => {
		return {
			success: true,
			result: result
		}
	})
}

// To filter all active products
module.exports.getProducts = (vendor_id) => {
	function findProduct(filter, projection) {
		return Product.find(filter, projection).then((products) => {
			return products
		})
	}

	if(!vendor_id){
		return findProduct({isActive: true}, {isActive: 0, createdOn: 0})
	}
	
	return findProduct({vendorId: vendor_id})

}

// Returns the product using its Id for non logged in user if product is active 
// Only admin and vendor can search for archived products
module.exports.getSingleProduct = async ( product_id, is_admin, access_type, user_id ) => {

	const product = await Product.findById(product_id).then((product) => product).catch(error => {
		return {
			success: false,
			error: "Product ID invalid."
		}
	});
	
	const found_product = {
		success: true, 
		product: product
	}

	if((product !== null && !product.isActive) && 
	(is_admin || access_type === 'vendor' && product.vendorId.toString() === user_id)){
		return found_product
	} else if(product.isActive){
		return found_product
	}

	return Promise.resolve({
		success: false,
		error: "Product not found!"
	})
	
};

// To update properties of a single product
// Only owner of product can update
module.exports.updateSingleProduct = async (data) => {
	let product = await Product.findById(data.id).then(product_found => {
		return product_found
	}).catch((error) => {
		return null
	})

	if(product !== null && product.vendorId.toString() === data.userId){
		
		product.brandName = data.updates.brandName,
		product.category = data.updates.category,
		product.description = data.updates.description,
		product.imageLink = data.updates.imageLink,
		product.isActive = data.updates.isActive,
		product.manufacturer = data.updates.manufacturer,
		product.name = data.updates.name,
		product.price = data.updates.price,
		product.quantity = data.updates.quantity


		return product.save().then(result => {
			return {
				success: true,
				product: result
			} 
		})
	}

	return Promise.resolve({
		success: false,
		message: "Failed to update product!"
	})
};

// ** work on archive next *


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
};

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
};

module.exports.isEnoughQuantity = async (quantity, product_id) => {
	return await Product.findById(product_id).then(result => {
		if(result.quantity >= quantity){
			return {
				success: true
			}
		}

		return {
			success: false,
			name: result.name
		}
		
	})
};

module.exports.updateProductQuantity = (product_id, quantity) => {
	return Product.findById(product_id).then(result => {
		result.quantity -= quantity;

		return result.save().then(saved_result => saved_result);
	});
};