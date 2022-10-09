const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const auth = require('../auth')

// To register a new user
router.post('/register', (request, response) => {
	UserController.register(request.body).then((result) => {
		response.send(result)
	})
})

// To login an account
router.post('/login', (request, response) => {
	UserController.login(request.body).then((result) => {
		response.send(result)
	})
})

// To retrieve user details
router.get('/:id/details', auth.verify, (request,response) => {
	// Save id and isAdmin information from token used for additional verification steps
	const token_user_id = auth.decode(request.headers.authorization).id
	const isAdmin = auth.decode(request.headers.authorization).isAdmin

	UserController.getUserDetails(token_user_id, isAdmin, request.params.id).then((result) => {
		response.send(result)
	})
})

// To change user access to admin
router.patch('/:id/admin', auth.verify, (request, response) => {
	const isAdmin = auth.decode(request.headers.authorization).isAdmin

	UserController.changeToAdmin(isAdmin, request.params.id).then(result => {
		response.send(result)
	})
})

module.exports = router