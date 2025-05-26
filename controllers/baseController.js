const utilities = require('../utilities')
const baseControlller = {}

baseControlller.buildHome = async function(req, res){
    const nav = await utilities.getNav()
    res.render("index", {title: "Home", nav})
}

module.exports = baseControlller