const express = require('express')
const router = express.Router()
const auth = require('../auth')
const CartController = require('../controllers/CartController')
module.exports = router

// For adding a product to cart
router.post('/', auth.verify, (request, response) => {
	const user = auth.decode(request.headers.authorization)
	const user_info = {
		cartId: user.cartId,
		isAdmin: user.isAdmin,
		accessType: user.accessType
	}
	CartController.addToCart(user_info, request.body).then(result => {
		response.send(result)
	})
})

// For removing a product from users cart
router.patch('/:id/:operator', auth.verify, (request, response) => {
	const cart_id = auth.decode(request.headers.authorization).cartId
	CartController.incrementOrDecrementQuantity(cart_id, request.params.id, request.params.operator)
	.then(result => {
		response.send(result)
	})
})

router.delete('/:id', auth.verify, (request,response) => {
	const cart_id = auth.decode(request.headers.authorization).cartId
	CartController.removeItem(cart_id, request.params.id).then(result => {
		response.send(result)
	})
})

router.patch('/checkout', auth.verify, (request, response) => {
	const user = auth.decode(request.headers.authorization)

	CartController.checkout(user, request.body).then(result => {
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


