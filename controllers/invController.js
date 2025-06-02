// controllers/invController.js
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator"); // <— IMPORTANT

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build detail view for a single vehicle
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const invId = req.params.invId;
    const data = await invModel.getVehicleById(invId);
    const nav = await utilities.getNav();
    const vehicleHtml = utilities.buildVehicleDetail(data);
    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      vehicleHtml,
    });
  } catch (error) {
    next(error);
  }
};

/* **********************************
 *  Show Management View
 * ********************************* */
invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav();
  const message = req.flash("message");
  res.render("inventory/manage", {
    title: "Inventory Management",
    nav,
    message,
  });
};

/* **********************************
 *  Show Add Classification Form
 * ********************************* */
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: [], // Always an array (initially empty)
    classification_name: null,
  });
};

/* **********************************
 *  Process Add Classification
 * ********************************* */
invCont.addClassification = async function (req, res) {
  const nav = await utilities.getNav();
  const { classification_name } = req.body;
  const result = await invModel.addClassification(classification_name);
  if (result && result.rowCount > 0) {
    req.flash(
      "message",
      `Classification "${classification_name}" added successfully.`
    );
    return res.redirect("/inv");
  }
  req.flash("message", "Failed to add classification.");
  res.render("inventory/manage", {
    title: "Inventory Management",
    nav,
    message: req.flash("message"),
  });
};

/* **********************************
 *  Show Add Inventory Form
 * ********************************* */
invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    errors: null, // Use null instead of empty array
    classificationList,
    inv_make: null,
    inv_model: null,
    inv_year: null,
    inv_price: null,
    inv_miles: null,
    inv_color: null,
    inv_image: null,
    inv_thumbnail: null,
    inv_description: null,
    classification_id: null,
  });
};

/* **********************************
 *  Process Add Inventory
 * ********************************* */
invCont.addInventoryItem = async function (req, res) {
  // By the time we get here, checkInventory() has already run.
  // If there were any validation errors, checkInventory() would have re‐rendered the form.

  // No validation errors → insert into database:
  const result = await invModel.addInventoryItem(req.body);
  if (result && result.rowCount > 0) {
    req.flash(
      "message",
      `Vehicle "${req.body.inv_make} ${req.body.inv_model}" added successfully.`
    );
    return res.redirect("/inv");
  }

  // If DB insertion failed:
  req.flash("message", "Failed to add vehicle.");
  const nav = await utilities.getNav();
  res.render("inventory/manage", {
    title: "Inventory Management",
    nav,
    message: req.flash("message"),
  });
};

module.exports = invCont;