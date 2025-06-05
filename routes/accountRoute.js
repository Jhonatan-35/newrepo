const express = require('express')
const router = express.Router()
const utilities = require('../utilities') // Assuming utilities/index.js is correctly set up
const accountController = require('../controllers/accountController') // You'll build this later
const regValidate = require("../utilities/account-validation")
const accountValidation = require('../utilities/account-validation')

// Route to display login view when "My Account" is clicked
router.get('/login', utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.get("/", utilities.handleErrors(accountController.buildAccountDashboard))


router.post(
  "/register",
  regValidate.registrationRules(), 
  accountController.registerAccount
)

t
router.post(
  "/login",
  accountValidation.loginRules(),
  accountValidation.checkLoginData,
  
  utilities.handleErrors(accountController.accountLogin)
)
module.exports = router