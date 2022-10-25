const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/ProductController')
const auth = require('../auth')

// To get all active products
router.get('/', (request,response) => {
	ProductController.getProducts().then((result) => {
		response.send(result)
	})
})

// To get a product by its Id
router.get('/:id', (request, response) => {
	function getProduct(product_id, is_admin, access_type, user_id){
		ProductController.getSingleProduct(product_id, is_admin, access_type, user_id).then((result) => {			
			response.send(result)
		})
	}
	const user = auth.decode(request.headers.authorization)
	if(user){
		const is_admin = user.isAdmin
		const access_type = user.accessType
		const user_id = user.id 

		getProduct(request.params.id, is_admin, access_type, user_id)
		return 
	}

	getProduct(request.params.id)

})

// To update product details(admin only)
router.patch('/:id/update', auth.verify, (request, response) => {
	const data = {
		id: request.params.id,
		updates: request.body,
		accessType: auth.decode(request.headers.authorization).accessType,
		userId: auth.decode(request.headers.authorization).id
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

router.patch('/:id/review', auth.verify, (request, response) => {
	const user_details = auth.decode(request.headers.authorization)

	ProductController.createReview(user_details, request.params.id, request.body).then(result => {
		response.send(result)
	})
})

module.exports = router