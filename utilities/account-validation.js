// utilities/account-validation.js
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.")
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* **********************************
 * Check data and return errors
 * ********************************* */
validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // If there are validation errors, re-render the form
    let nav = await utilities.getNav()
    let notice = req.flash("notice")  // always include notice

    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      notice,
      errors: errors.array(),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
  next()
}

const loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
  ]
}

// const checkLoginData = async (req, res, next) => {
//   const { account_email } = req.body
//   let errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     return res.render("account/login", {
//       errors: errors.array(),
//       account_email,
//     })
//   }
//   next()
// }
// Example for checkLoginData
  const checkLoginData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
        title: "Login",
        nav,
        notice: [], // Explicitly pass empty array
        errors: errors.array(),
        account_email: req.body.account_email
      })
      return
    }
    next()
  }

// Add new validation rules
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required."),
    
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required."),
    
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required.")
      .custom(async (account_email, { req }) => {
        const account = await accountModel.getAccountByEmail(account_email);
        if (account && account.account_id != req.body.account_id) {
          throw new Error("Email exists. Please use a different email.");
        }
      })
  ];
};

validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements.")
  ];
};

// Add validation check middleware
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const accountData = await accountModel.getAccountById(req.body.account_id);
    return res.render("account/update", {
      title: "Update Account",
      accountData,
      errors: errors.array(),
    });
  }
  next();
};

// Export new methods



module.exports = {
  registrationRules: validate.registrationRules,
  checkRegData: validate.checkRegData,
  loginRules,
  checkLoginData,
  ...validate,
  updateAccountRules: validate.updateAccountRules,
  updatePasswordRules: validate.updatePasswordRules,
  checkUpdateData: validate.checkUpdateData
}