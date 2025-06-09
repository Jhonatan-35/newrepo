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
  const classificationSelect = await utilities.buildClassificationList();
  const message = req.flash("message");
  
  // Get account data from locals
  const accountData = {
    firstname: res.locals.firstname,
    account_id: res.locals.account_id,
    account_type: res.locals.account_type
  };

  res.render("inventory/manage", {
    title: "Inventory Management",
    nav,
    message,
    classificationSelect, 
    errors: null,
    accountData  // Pass accountData to the view
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

invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = req.params.classification_id;
  const inventoryData = await invModel.getInventoryByClassificationId(classification_id);
  res.json(inventoryData);
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render('inventory/edit-inventory', {
      title: 'Edit ' + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    });
  } catch (error) {
    next(error);
  }
};


invCont.updateInventory = async function (req, res) {
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  );

  if (updateResult) {
    req.flash("message", `The ${inv_make} ${inv_model} was successfully updated.`);
    return res.redirect("/inv");
  } else {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    res.status(501).render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
  }
};


/* ***************************
 *  Build Delete Inventory View
 * ************************** */
invCont.buildDeleteView = async(req, res, next) => {
  const inv_id = parseInt(req.params.inv_id);
  const nav = await utilities.getNav(); 
  const itemData = await invModel.getInventoryItemById(inv_id); 
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("inventory/delete-confirm", {
    title: `Delete ${itemName}`,
    nav,
    item: {
      make: itemData.inv_make,
      model: itemData.inv_model,
      year: itemData.inv_year,
      price: itemData.inv_price,
      inv_id: itemData.inv_id
    },
    errors: null
  });
}

/* ***************************
 *  Handle Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async (req, res, next) => {
  const inv_id = parseInt(req.body.inv_id);
  const deleteResult = await invModel.deleteInventoryItem(inv_id);

  if (deleteResult.rowCount === 1) {
    req.flash("notice", "Inventory item deleted successfully.");
    res.redirect("/inv");
  } else {
    req.flash("notice", "Delete failed. Please try again.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
};

module.exports = invCont;