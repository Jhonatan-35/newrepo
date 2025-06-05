const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  let notice = req.flash("notice")
  res.render("account/login", {
    title: "Login",
    nav,
    notice,
    errors: null  
  })
}



/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  let notice = req.flash("notice")
  res.render("account/register", {
    title: "Register",
    nav,
    notice: req.flash("notice"),
    errors: null,
    account_firstname: null,
    account_lastname: null,
    account_email: null
  })
}
/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      notice: req.flash("notice"),
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  // Save user to DB with hashed password
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult?.rows?.length > 0) {
    req.flash(
      "notice",
      `Congratulations, you’re registered ${account_firstname}. Please log in.`
    )
    res.redirect("/account/login")
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(500).render("account/register", {
      title: "Register",
      nav,
      notice: req.flash("notice"),
      account_firstname,
      account_lastname,
      account_email,
      errors: null
    })
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount, 
}