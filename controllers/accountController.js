const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

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
    res.status(501).render("account/register", {
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

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      notice: req.flash("notice") || [],
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        notice: req.flash("notice") || [],
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      notice: ["Unexpected error occurred. Please try again."],
      errors: [],
      account_email
  })
}
}

// Update all controller functions to include nav
async function buildAccountDashboard(req, res) {
  let nav = await utilities.getNav();
  res.render("account/dashboard", {
    title: "Account Dashboard",
    nav  //nav here
  });
}

async function buildUpdateView(req, res) {
  const account_id = parseInt(req.params.account_id);
  if (account_id !== res.locals.account_id) {
    req.flash("notice", "Unauthorized access attempt");
    return res.redirect("/account");
  }
  
  const accountData = await accountModel.getAccountById(account_id);
  let nav = await utilities.getNav();  // Get navigation
  
  res.render("account/update", {
    title: "Update Account",
    nav,  // Add nav here
    accountData,
    errors: null,
    message: null
  });
}

async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  );

  if (updateResult) {
    // Refresh account data
    const accountData = await accountModel.getAccountById(account_id);
    req.flash("notice", "Account updated successfully");
    res.render("account/dashboard", {
      title: "Account Dashboard",
      accountData,
      nav: await utilities.getNav()
    });
  } else {
    const accountData = await accountModel.getAccountById(account_id);
    req.flash("notice", "Update failed. Please try again.");
    res.render("account/update", {
      title: "Update Account",
      accountData,
      errors: null,
      message: req.flash("notice")
    });
  }
}

async function updatePassword(req, res) {
  const { account_password, account_id } = req.body;
  
  // Hash new password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "Password processing error");
    return res.redirect(`/account/update/${account_id}`);
  }

  const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

  if (updateResult) {
    req.flash("notice", "Password updated successfully");
    res.redirect("/account");
  } else {
    req.flash("notice", "Password update failed");
    res.redirect(`/account/update/${account_id}`);
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount, 
  accountLogin,
  buildAccountDashboard,
  buildUpdateView,
  updateAccount,
  updatePassword,
}