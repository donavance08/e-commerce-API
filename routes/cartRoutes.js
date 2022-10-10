const express = require('express')
const router = express.Router()
const auth = require('../auth')
const CartController = require('../controllers/CartController')
module.exports = router

// For adding a product to cart
router.patch('/add', auth.verify, (request, response) => {
	const cartId = auth.decode(request.headers.authorization).cartId
	CartController.addToCart(cartId, request.body).then(result => {
		response.send(result)
	})
})

// For removing a product from users cart
router.patch('/:id/change-quantity', auth.verify, (request, response) => {
	const cart_id = auth.decode(request.headers.authorization).cartId
	CartController.removeFromCart(cart_id, request.params.id).then(result => {
		response.send(result)
	})
})


