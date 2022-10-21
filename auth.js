const jwt = require('jsonwebtoken')
const secretPhrase = "ECommerceAPICapstone2"

// Create access token for successful user login
module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
		email: user.email,
		cartId: user.cartId,
		accessType: user.accessType,
		isAdmin: user.isAdmin
	}

	return jwt.sign(data, secretPhrase, {})
}

module.exports.verify = (request, response, next) => {
	let token = request.headers.authorization

	// check if token is not empty
	if(typeof token !== "undefined"){

		token = token.slice(7, token.length)

		// verify if token came from this API
		return jwt.verify(token, secretPhrase, (error, data) => { 
			if(error){
				return response.send({
					auth: "Failed."
				})
			} else {
				next()
			}

		})

	// If token does not exist 
	} else {
		return response.send({
			auth: "Failed."
		})
	}
}

// Decoding a token to retrieve user information
module.exports.decode = (token) => {

	// Token recieved and is not undefined
	if(typeof token !== "undefined"){

		// Retrieves only the token and removes the "Bearer " prefix
		token = token.slice(7, token.length);

		return jwt.verify(token, secretPhrase, (error, data) => {

			if (error) {

				return null;

			} else {

				// The "decode" method is used to obtain the information from the JWT
				// The "{complete:true}" option allows us to return additional information from the JWT token
				// Returns an object with access to the "payload" property which contains user information stored when the token was generated
				// The payload contains information provided in the "createAccessToken" method defined above (e.g. id, email, cartId and accessType )
				return jwt.decode(token, {complete:true}).payload
			};

		})

	// Token does not exist
	} else {

		return null;

	};		
};

