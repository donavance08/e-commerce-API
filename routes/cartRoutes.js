const express = require('express')
const router = express.Router()
const auth = require('../auth')
const CartController = require('../controllers/CartController')
module.exports = router

// For adding a product to cart
router.patch('/add', auth.verify, (request, response) => {
	const user = auth.decode(request.headers.authorization)
	CartController.addToCart(user, request.body).then(result => {
		response.send(result)
	})
})

// For removing a product from users cart
router.patch('/:id/:operator/change-quantity', auth.verify, (request, response) => {
	const cart_id = auth.decode(request.headers.authorization).cartId
	CartController.incrementOrDecrementQuantity(cart_id, request.params.id, request.params.operator)
	.then(result => {
		response.send(result)
	})
})

router.patch('/:id/remove', auth.verify, (request,response) => {
	const cart_id = auth.decode(request.headers.authorization).cartId
	CartController.removeItem(cart_id, request.params.id).then(result => {
		response.send(result)
	})
})

router.patch('/checkout', auth.verify, (request, response) => {
	const user = auth.decode(request.headers.authorization)
	// const user_id = auth.decode(request.headers.authorization).id
	CartController.checkout(user).then(result => {
		response.send(result)
	})
})

router.get('/', auth.verify, (request, response) => {
	const user = auth.decode(request.headers.authorization)
	CartController.getCart(user).then(result => {
		response.send(result)
	})
})

router.get('/:id', auth.verify, (request, response) => {
	const user = auth.decode(request.headers.authorization)
	CartController.adminGetCart(user, request.params.id).then(result => {
		response.send(result)
	}) 
})


