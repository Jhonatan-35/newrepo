/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const app = express();

const staticRoutes = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities");

const session = require("express-session");
const pool = require("./database/");
const accountRoute = require("./routes/accountRoute");

// Body‐parser is no longer needed separately—express.json() and express.urlencoded() suffice

/* ***********************
 * Middleware
 *************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Express‐message (flash) middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Body parsing (JSON & URL‐encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // layout file in /views/layouts/layout.ejs

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes); // Static files (e.g. /public)

app.get("/", utilities.handleErrors(baseController.buildHome));

app.use("/inv", inventoryRoute); // Inventory routes (only once!)

app.use("/account", accountRoute); // Account routes

/* ***********************
 * 404 Handler (File Not Found)
 * Must come after all routes
 *************************/
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * General Error Handler (for 500, etc.)
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "500 Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Server Listener
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});