const express = require('express')
const auth = require('../auth')
const router = express.Router()
const OrderController = require('../controllers/OrderController')

// Create an order
router.post('/create', auth.verify, (request, response) => {
	const user_id = auth.decode(request.headers.authorization).id
	
	OrderController.createNewOrder(user_id, request.body).then((result) => {
		response.send(result)
	})
})

// Get user orders
router.get('/', auth.verify, (request, response) => {
	// Forward isAdmin and user_id from token used additional validation  
	const user_id = auth.decode(request.headers.authorization).id

	OrderController.getUserOrders(user_id).then(result => {
		response.send(result)
	})

})
// Retrieve all orders(Admin only)
router.get('/all', auth.verify, (request, response) => {
	const isAdmin = auth.decode(request.headers.authorization).isAdmin
	OrderController.getAllOrders(isAdmin).then(result => {
		response.send(result)
	})
})

router.get('/:id', auth.verify, (request, response) => {
	const user = auth.decode(request.headers.authorization)
	OrderController.getOrderById(user, request.params.id).then(result => {
		response.send(result)
	})
} )

router.patch('/:id/cancel', auth.verify, (request, response) => {
	const user = auth.decode(request.headers.authorization)
	OrderController.cancelOrder(user, request.params.id).then(result => {
		response.send(result)
	})
})

module.exports = router
