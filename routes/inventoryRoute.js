const express = require('express')
const router = express.Router()
const invController = require('../controllers/invController')

// Route to build inventory by classification view
router.get('/type/:classificationId', invController.buildByClassificationId)
router.get("/detail/:invId", invController.buildByInvId);

router.get("/trigger-error", (req, res, next) => {
    try {
        throw new Error("This is an intentional error for testing.");
    } catch (error) {
        next(error);
    }
    });


module.exports = router;