const express = require('express')
const router = express.Router()
let testController = require('../controller/testController')

let middleware = require('../common/middleware/middleware')
let Middleware = new middleware()

let TestController = new testController()

router.post('/create-user' , TestController.createUser)
router.post('/login-user' , TestController.loginUser)

router.post('/list-user' , Middleware.checkAuthorization, TestController.listUser)
router.post('/filter-user' , Middleware.checkAuthorization, TestController.filterUser)
router.post('/sort-user' , Middleware.checkAuthorization, TestController.sortUser)



module.exports = router