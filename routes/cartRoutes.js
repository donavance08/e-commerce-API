const express = require('express')
const router = express.Router()
const auth = require('../auth')
const CartController = require('../controllers/CartController')
module.exports = router

router.patch('/add', auth.verify, (request, response) => {
	const cartId = auth.decode(request.headers.authorization).cartId
	CartController.addToCart(cartId, request.body).then(result => {
		response.send(result)
	})
})
