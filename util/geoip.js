var request = require('request');
var Promise = require('bluebird');
var app_logger = require("../logger/logger");

exports.getGeoData = function(remoteIp){
    return new Promise(function(resolve, reject){
        var url = "http://www.telize.com/geoip/" + remoteIp;
        app_logger.info("Fetching ip address details for ip "+remoteIp+" with Url "+url);
        request.get(url, function(err, res, data){
           if(err){reject(err); return;}
            resolve(data);
        });
    });

};