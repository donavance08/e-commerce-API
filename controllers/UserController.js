const User = require('../models/User')
const bcrypt = require('bcrypt')
const auth = require('../auth')
const Cart = require('../models/Cart')

// projection format for admin use
const projection_admin = {
	password: 0,
	isAdmin: 0,
}

// projection format for use of non admin accounts
const projection_user = {
	password: 0,
	isAdmin: 0,
	accessType: 0,
	isActive: 0,
	registrationDate: 0
}
// function to find a user by its _id
const findId = (id, projection) => {
	return User.findOne({_id: id}, projection).then((result) => {
		
		if(result !== null){
			return result
		}

		return {
			message: "Cannot find user information!"
		}
	})
}
// check if email in use
module.exports.isEmailUsed = (email)=> {
	return User.findOne({email: email}).then(result => {
		if(result != null){
			return true
		}
		return false
	})
}

// New user registration
module.exports.register = async (data, accessType) => {

	// Check first if email already in use
	if(await this.isEmailUsed(data.email)){
		return Promise.resolve({
			message: "Email already in use!"
		})
	}
		// Encrypt the password for security
		let encrypted_password = bcrypt.hashSync(data.password, 10)
		const cart =  new Cart({})

		// Disable cart for non buyers
		if(data.accessType != "user"){
			cart.isActive = false
		}
		cart.save()
		// Create a user based on Schema for saving to DB
		let new_user = new User({
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			contactNo: data.contactNo,
			password: encrypted_password,
			accessType: accessType,
			// address: {
			// 	houseNo: data.address.houseNo,
			// 	streetName: data.address.streetName,
			// 	city: data.address.city,
			// 	province: data.address.province,
			// 	country: data.address.country,
			// 	zip: data.address.zip
			// },
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

	// })
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
module.exports.getUserDetails = async (token_id, is_admin, user_id) => {

	// Admin can locate any users account details
	if(is_admin && user_id != undefined){
		return findId(user_id, projection_admin)
	}

	// To locate details for a non admin account
	return findId(token_id, projection_user)

}

// delete a users account
module.exports.deleteAccount = async (token_id, is_admin, user_id ) => {
	let account
	
	if(is_admin && user_id != undefined){
		account = await findId(user_id, projection_admin)
	} else {
		account  = await findId(token_id, projection_user)
	}

	account.isActive = false
	return account.save()
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