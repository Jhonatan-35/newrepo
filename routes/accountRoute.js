const express = require('express')
const router = express.Router()
const utilities = require('../utilities') // Assuming utilities/index.js is correctly set up
const accountController = require('../controllers/accountController') // You'll build this later
const regValidate = require("../utilities/account-validation")
const accountValidation = require('../utilities/account-validation')

// Route to display login view when "My Account" is clicked
router.get('/login', utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

//router.post('/register', utilities.handleErrors(accountController.registerAccount))
// Route for processing registration
router.post(
  "/register",
  regValidate.registrationRules(), // 💡 Apply the rules
  regValidate.checkRegData,        // 💡 Handle errors
  accountController.registerAccount
)

// Process the login attempt
router.post(
  "/login",
  accountValidation.loginRules(),
  accountValidation.checkLoginData,
  (req, res) => {
    res.status(200).send('login process')
  }
)
module.exports = router