var express = require('express');
var router = express.Router();var ROOT_DIR = process.env.PWD;
var urlController = require(ROOT_DIR+"/controllers/url_controller.js");
var appLogger = require(ROOT_DIR+"/logger/logger.js");

router.get("/:shortUrl", function(req, res, next){
    appLogger.info("Got request to redirect the short url to original url with contents ",req.params);
    urlController.redirectShortUrl(req, res);
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
module.exports = router;
