const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const auth = require('../auth')
module.exports = router

// register as courier
router.post('/register', (request,response) => {
    UserController.register(request.body, "courier").then(result => {
        response.send(result)
    })
})

// login as courier
router.post('/login', (request, response) => {
	UserController.login(request.body).then((result) => {
		response.send(result)
	})
})

// get courier account details
router.get('/account/details', auth.verify, (request,response) => {
	// Save id from token to use for pulling up user info
	const courier_id = auth.decode(request.headers.authorization).id

	UserController.getUserDetails(courier_id).then((result) => {
		response.send(result)
	})
})

// delete/disable courier account
router.patch('/account/details/delete', auth.verify, (request,response)=> {
	const user_id = auth.decode(request.headers.authorization).id
	UserController.deleteAccount(user_id).then(result => {
		response.send(result)
	})
})

