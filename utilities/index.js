const invModel = require("../models/inventory-model")

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
async function getNav(req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
async function buildClassificationGrid(data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

function buildVehicleDetail(vehicle) {
    const formatter = new Intl.NumberFormat("en-US")
    const price = `$${formatter.format(vehicle.inv_price)}`
    const miles = `${formatter.format(vehicle.inv_miles)} miles`

    return `
        <div class="vehicle-detail">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        <div class="vehicle-info">
            <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
            <h3>${price}</h3>
            <p><strong>Description:</strong> ${vehicle.inv_description}</p>
            <p><strong>Color:</strong> ${vehicle.inv_color}</p>
            <p><strong>Mileage:</strong> ${miles}</p>
        </div>
        </div>
    `
}

async function buildClassificationList(selectedId = null) {
  const data = await invModel.getClassifications()
  let list = '<select name="classification_id" id="classificationList" required>'
  list += `<option value="">Choose a Classification</option>`
  data.rows.forEach(row => {
    list += `<option value="${row.classification_id}"${row.classification_id == selectedId ? " selected" : ""}>`
    list += `${row.classification_name}</option>`
  })
  list += "</select>"
  return list
}

/* ****************************************
 * Error wrapper
 **************************************** */
function handleErrors(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

module.exports = {
    getNav,
    buildClassificationGrid,
    buildVehicleDetail,
    handleErrors,
    buildClassificationList,

}