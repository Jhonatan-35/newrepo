// utilities/inventory-validation.js
const { body, validationResult } = require("express-validator");
const utilities = require(".");

const validate = {};

/* **********************************
 *  Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => [
  body("classification_name")
    .trim()
    .notEmpty()
    .withMessage("Classification name is required.")
    .isAlphanumeric()
    .withMessage("No spaces or special characters allowed."),
];

/* **********************************
 *  Inventory Validation Rules
 * ********************************* */
validate.inventoryRules = () => [
  body("classification_id")
    .notEmpty()
    .withMessage("A classification must be selected."),

  body("inv_make")
    .trim()
    .notEmpty()
    .withMessage("Make is required.")
    .isLength({ min: 2 })
    .withMessage("Make must be at least 2 characters."),

  body("inv_model")
    .trim()
    .notEmpty()
    .withMessage("Model is required.")
    .isLength({ min: 1 })
    .withMessage("Model must be at least 1 character."),

  body("inv_year")
    .trim()
    .notEmpty()
    .withMessage("Year is required.")
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("Enter a valid year."),

  body("inv_price")
    .trim()
    .notEmpty()
    .withMessage("Price is required.")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number."),

  body("inv_miles")
    .trim()
    .notEmpty()
    .withMessage("Miles is required.")
    .isInt({ min: 0 })
    .withMessage("Miles must be a non-negative integer."),

  body("inv_color")
    .trim()
    .notEmpty()
    .withMessage("Color is required."),

  body("inv_image")
    .trim()
    .notEmpty()
    .withMessage("Image path is required."),

  body("inv_thumbnail")
    .trim()
    .notEmpty()
    .withMessage("Thumbnail path is required."),

  body("inv_description")
    .trim()
    .notEmpty()
    .withMessage("Description is required."),
];

/* **********************************
 *  Handle Validation Errors for Classification
 * ********************************* */
validate.checkClassification = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array().map(err => ({ param: err.param, msg: err.msg })),
      classification_name: req.body.classification_name,
    });
  }
  next();
};

/* **********************************
 *  Handle Validation Errors for Inventory
 * ********************************* */
// utilities/inventory-validation.js
validate.checkInventory = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("⚠️  Validation errors in checkInventory:", errors.array());
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    );
    
    // Return the same view with error messages
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: errors.array(),  // Pass errors directly
      // Pass form data back to repopulate fields
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_description: req.body.inv_description,
      classification_id: req.body.classification_id,
    });
  }
  next();
};

module.exports = validate;