const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const ProductController = require('../controllers/ProductController')
const auth = require('../auth')
module.exports = router

router.post('/register', (request,response) => {
    UserController.register(request.body, "vendor").then(result => {
        response.send(result)
    })
})

//login a vendor account
router.post('/login', (request, response) => {
	UserController.login(request.body).then((result) => {
		response.send(result)
	})
})

// vendor account details route
router.get('/account/details', auth.verify, (request,response) => {
	// Save id from token to use for pulling up user info
	const vendor_id = auth.decode(request.headers.authorization).id
	// const is_admin = auth.decode(request.headers.authorization).isAdmin

	UserController.getUserDetails(vendor_id).then((result) => {
		response.send(result)
	})
})

// vendor disable account
router.patch('/account/details/delete', auth.verify, (request,response)=> {
	const user_id = auth.decode(request.headers.authorization).id
	UserController.deleteAccount(user_id).then(result => {
		response.send(result)
	})
})

// vendor get products listed
router.get('/products', auth.verify, (request, response) => {
	const vendor_id = auth.decode(request.headers.authorization).id
	ProductController.getProducts(vendor_id).then((result) => {
		response.send(result)
	} )
})

// vendor add product to be sold
router.post('/products/add', auth.verify, (request, response) => {
	const vendor_id = auth.decode(request.headers.authorization).id
	ProductController.addProduct(vendor_id, request.body).then((result) => {
		response.send(result)
	} )
})

