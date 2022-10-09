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

// Get personal orders
router.get('/user', auth.verify, (request, response) => {
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

module.exports = router
