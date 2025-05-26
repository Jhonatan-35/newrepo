function handleErrors(err, req, res, next) {
    console.error(err.stack);
    const nav = req.app.locals.nav || "";
    res.status(err.status || 500).render("errors/error", {
        title: "Server Error",
        message: "Something went wrong!",
        nav,
    });
    }

module.exports = handleErrors;