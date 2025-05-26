const express = require('express')
const router = express.Router()
const invController = require('../controllers/invController')


router.get('/type/:classificationId', invController.buildByClassificationId)
router.get("/detail/:invId", invController.buildByInvId);

router.get("/error-link", (req, res, next) => {
    try {
        throw new Error("Erro trail.");
    } catch (error) {
        next(error);
    }
    });


module.exports = router;