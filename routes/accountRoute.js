const express = require('express')
const router = express.Router()
const utilities = require('../utilities') 
const accountController = require('../controllers/accountController') // build this later
const regValidate = require("../utilities/account-validation")
const accountValidation = require('../utilities/account-validation')
const {requireAuth}  = require('../utilities/auth')

console.log("handleErrors:", utilities.handleErrors)


// Route to display login view when "My Account" is clicked
router.get('/login', utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

//router.get("/", utilities.handleErrors(accountController.buildAccountDashboard))
// Add new routes
router.get(
  "/update/:account_id",
  requireAuth,
  utilities.handleErrors(accountController.buildUpdateView)
);

router.post(
  "/update",
  requireAuth,
  accountValidation.updateAccountRules(),
  accountValidation.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

router.post(
  "/update-password",
  requireAuth,
  accountValidation.updatePasswordRules(),
  accountValidation.checkUpdateData,
  utilities.handleErrors(accountController.updatePassword)
);



router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountDashboard)
)

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
  // (req, res) => {
  //   res.status(200).send('login process')
  // },
  utilities.handleErrors(accountController.accountLogin)
)

router.get(
  "/",
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildManagement))

router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});


module.exports = router