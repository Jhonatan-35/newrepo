const pool = require('../database/')

/* ***************************
 *  Get all classification data
 * ************************** */

async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
*  Get all inventory items and classification_name by classification_id
* ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}

async function getVehicleById(inv_id) {
    try {
        const result = await pool.query(
        `SELECT * FROM public.inventory WHERE inv_id = $1`,
        [inv_id]
        );
        return result.rows[0];
    } catch (error) {
        throw error;
    }
    }


    /* **********************************
 *  Add new classification
 * ********************************* */
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO classification (classification_name)
      VALUES ($1)
      RETURNING *`
    return await pool.query(sql, [classification_name])
  } catch (error) {
    console.error(error)
    return null
  }
}

/* **********************************
 *  Add new inventory item
 * ********************************* */
async function addInventoryItem({
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
}) {
  try {
    const sql = `
      INSERT INTO inventory
        (classification_id, inv_make, inv_model, inv_year,
         inv_description, inv_image, inv_thumbnail,
         inv_price, inv_miles, inv_color)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`
    const params = [
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
    ]
    return await pool.query(sql, params)
  } catch (error) {
    console.error(error)
    return null
  }
}

// Get inventory item by inventory ID
async function getInventoryById(inv_id) {
  try {
    const sql = 'SELECT * FROM inventory WHERE inv_id = $1';
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0]; // returns object with inventory data
  } catch (error) {
    throw error;
  }
}

async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE inventory
      SET
        classification_id = $1,
        inv_make = $2,
        inv_model = $3,
        inv_year = $4,
        inv_description = $5,
        inv_image = $6,
        inv_thumbnail = $7,
        inv_price = $8,
        inv_miles = $9,
        inv_color = $10
      WHERE inv_id = $11
      RETURNING *`;
      
    const params = [
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
      inv_id
    ];
    
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.error("Update error:", error);
    return null;
  }
}

/* ***************************
 *  Get inventory item by ID
 * ************************** */
async function getInventoryItemById(inv_id) {
  return await pool.query(
    "SELECT * FROM public.inventory WHERE inv_id = $1",
    [inv_id]
  ).then(result => result.rows[0]);
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    throw error;
  }
}



module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getVehicleById,
    addClassification,
    addInventoryItem,
    getInventoryById,
    updateInventory,
    deleteInventoryItem,
    getInventoryItemById
}