const User = require('../models/User')
const bcrypt = require('bcrypt')
const auth = require('../auth')
const Cart = require('../models/Cart')

// New user registration
module.exports.register =  (data) => {
		
	// Check first if email already in use
	return User.findOne({email: data.email}).then((result) => {
		if(result !== null){
			return {
				message: "Email already in use!"
			}
		}
		// Encrypt the password for security
		let encrypted_password = bcrypt.hashSync(data.password, 10)
		const cart =  new Cart({})
		cart.save()
		// Create a user based on Schema for saving to DB
		let new_user = new User({
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			contactNo: data.contactNo,
			password: encrypted_password,
			address: {
				houseNo: data.address.houseNo,
				streetName: data.address.streetName,
				city: data.address.city,
				province: data.address.province,
				country: data.address.country,
				zip: data.address.zip
			},
			cartId: cart._id
		})

		// Save new_user to the database
		return new_user.save().then((new_registered_user) => {
			// In case save fails, it will return null value
			// Check if save succeeded or not
			if(new_registered_user !== null){
				// If successfull, return a message to confirm new user is registered
				return {
					message: `Successfully registered ${data.email}.`
				}
			}
			// Else - return message that registration has failed
			return {
				message: "Failed to register new user"
			}
		})	

	})
}
// Login a user
module.exports.login = (data) => {
	// Check first if the login email is in the system
	return User.findOne({email: data.email.toLowerCase()}).then((result) => {
		if(result == null){
			return {
				message: "User doesn't exist!"
			}
		}

		const is_password_correct = bcrypt.compareSync(data.password, result.password)
		// Verify if the password matches and respond with a token if true
		if(is_password_correct){
			return { 
				accessToken: auth.createAccessToken(result),
				message: "Login successfull."
			}
		}

		// Return a message if password is incorrect
		return {
			message: 'Password is incorrect!'
		}
	})
}

// Retrieve details of the user without sensitive information
module.exports.getUserDetails = (token_id, isAdmin, user_id) => {
	// verify to make sure only Admin or Owner of own account can view details else return an error message
	if(token_id === user_id || isAdmin){
		// look for the user information and return to the user
		return User.findOne({_id: user_id}, {password: 0, isAdmin: 0}).then((result) => {
			if(result !== null){
				return result
			}

			return {
				message: "Cannot find user information!"
			}
		})
	}

	return Promise.resolve({
		message: "You must be logged in to own account before you can retrieve your details"
	})
}

// Convert user to Admin
module.exports.changeToAdmin = (isAdmin, user_id) => {
	// Verify if user trying to make the change is an admin - if true, proceed - if not, return an error
	if(isAdmin){
		// Located the user Id to be changed - if found: proceed to change - else: return an error message
		return User.findOne({_id: user_id}).then(result => {
			if(result !== null){
				if(!result.isAdmin){
					result.isAdmin = true

					// Attempt to save the changes - send a message if successful or not 
					return result.save().then(admin_user => {
						if(admin_user !== null){
							return {
								message: `Successfully changed ${result.email} to admin.`
							}
						}

						return {
							message: `Unexpected error. Unable to change ${result.email} to admin!`
						}
					})
				}
				return {
					message: `${result.email} is already an admin. No changes made.`
				}
			}

			return {
				message: "Cannot find user Id!"
			}
		}).catch(error => {
			return {
				message: "Invalid user Id format!"
			}
		})
	}

	return Promise.resolve({
		message: "Only admin users can make this change!"
	})
}