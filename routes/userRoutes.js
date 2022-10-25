const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const auth = require('../auth')
module.exports = router

router.post('/check-email', (request,response) => {
	
	UserController.isEmailUsed(request.body.email).then(result => response.send(result))

})
// To register a new user
router.post('/register', (request, response) => {
	UserController.register(request.body, "user").then((result) => {
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
router.get('/account/details', auth.verify, (request,response) => {
	
	// Save id and isAdmin from token to use for pulling up user info
	const user_id = auth.decode(request.headers.authorization).id
	const is_admin = auth.decode(request.headers.authorization).isAdmin

	UserController.getUserDetails(user_id, is_admin).then((result) => {
		response.send(result)
	})
})

// To retrieve a user's account by an Admin
router.get('/account/details/:id', auth.verify, (request,response) => {
	// Save id and isAdmin information from token used for additional verification steps
	const user_id = auth.decode(request.headers.authorization).id
	const is_admin = auth.decode(request.headers.authorization).isAdmin

	UserController.getUserDetails(user_id, is_admin, request.params.id).then((result) => {
		response.send(result)
	})
})

// To delete/disable an account
router.patch('/account/details/delete', auth.verify, (request,response)=> {
	const user_id = auth.decode(request.headers.authorization).id
	UserController.deleteAccount(user_id).then(result => {
		response.send(result)
	})
})

// admin route for deleting/disabling an user's account
router.patch('/account/details/delete/:id', auth.verify, (request,response)=> {
	const user = auth.decode(request.headers.authorization)
	
	UserController.deleteAccount(user.id, user.isAdmin, request.params.id).then(result => {
		response.send(result)
	})
})



// To change user access to admin
// ** disabled *
// router.patch('/:id/admin', auth.verify, (request, response) => {
// 	const isAdmin = auth.decode(request.headers.authorization).isAdmin

// 	UserController.changeToAdmin(isAdmin, request.params.id).then(result => {
// 		response.send(result)
// 	})
// })

