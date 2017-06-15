const http = require("http");

module.exports = (app) => {

    app.get("/", (req, res) => {
      res.render("index");
    });
    
};
