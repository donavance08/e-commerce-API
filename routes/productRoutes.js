const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/ProductController')
const auth = require('../auth')

// To create a product(admin only)
router.post('/create', auth.verify, (request, response) => {
	const data = {
		product: request.body,
		isAdmin: auth.decode(request.headers.authorization).isAdmin
	}
	ProductController.createProduct(data).then((result) => {
		response.send(result)
	} )
})

// To get all active products
router.get('/', (request,response) => {
	ProductController.getAllActiveProducts().then((result) => {
		response.send(result)
	})
})

// To get a product by its Id
router.get('/:id', (request, response) => {
	ProductController.getSingleProduct(request.params.id).then((result) => {
		response.send(result)
	})
})

// To update product details(admin only)
router.patch('/:id/update', auth.verify, (request, response) => {
	const data = {
		id: request.params.id,
		updates: request.body,
		isAdmin: auth.decode(request.headers.authorization).isAdmin
	}
	ProductController.updateSingleProduct(data).then((result)=> {
		response.send(result)
	})
})

// To archive a product(admin only)
router.patch('/:id/archive', auth.verify, (request,response) => {
	const isAdmin = auth.decode(request.headers.authorization).isAdmin
	ProductController.archiveSingleProduct(request.params.id, isAdmin).then((result) => {
		response.send(result)
	})
})

module.exports = router