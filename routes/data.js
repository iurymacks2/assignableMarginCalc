// var express = require('express');
// var router = express.Router();

const controller = require("../controllers/data.controller");

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // app.get("/data", controller.dataclient);
  app.post("/data", controller.dataclient);

}

