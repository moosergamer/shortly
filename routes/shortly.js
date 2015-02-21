var express = require('express');
var router = express.Router();
var ROOT_DIR = process.env.PWD;
var urlController = require(ROOT_DIR+"/controllers/url_controller.js");
var appLogger = require(ROOT_DIR+"/logger/logger.js");

router.post("/", function(req, res, next){
    appLogger.info("Got request to generate short url with contents ",req.body);
    urlController.generateShortURL(req, res);
});


module.exports = router;