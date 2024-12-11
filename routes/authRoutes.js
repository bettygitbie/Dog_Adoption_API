// Replace this file with the routes of your API
const {Router} = require('express')
const authController = require('../controllers/authController')
const {reqAuth} = require('../middlewares/authMiddleware')

const router = Router()

router.get('/register',authController.register_get)

router.get('/login', authController.login_get)

router.get('/user', authController.user_get)

router.get('/logout',authController.logout_get)

router.get('/doglist/registered', reqAuth, authController.registered_get)

router.get('/doglist/adopted', reqAuth, authController.adopted_get)

router.post('/dogs', reqAuth, authController.dog_post)

router.post('/register', authController.register_post)

router.post('/login', authController.login)

router.post('/adopt/:id', reqAuth, authController.dog_adopt)

router.delete('/remove/:id', reqAuth, authController.remove_dog)

module.exports = router
