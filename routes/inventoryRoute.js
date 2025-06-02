// routes/inventoryRoute.js
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities");

// Route to display inventory by classification
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display vehicle detail
router.get("/detail/:invId", invController.buildByInvId);

// Trigger‐error route (for testing)
router.get("/trigger-error", (req, res, next) => {
  try {
    throw new Error("This is an intentional error for testing.");
  } catch (error) {
    next(error);
  }
});

// Management view
router.get("/", utilities.handleErrors(invController.buildManagement));

// Add Classification (GET + POST)
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassification,
  utilities.handleErrors(invController.addClassification)
);

// Add Inventory (GET + POST)
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventory,
  utilities.handleErrors(invController.addInventoryItem)
);

module.exports = router;