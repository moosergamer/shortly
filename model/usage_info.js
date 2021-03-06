var Promise = require('bluebird');
var esClient = require('../bin/es_client');
var app_logger = require("../logger/logger");
var UAParser = require('ua-parser-js');
var GeoIp = require("../util/geoip");

var UsageInfo = function (data) {
    this.data = data;
};


UsageInfo.prototype.data = {};

UsageInfo.prototype.save = function () {
    if (Object.keys(this.data).length > 1) {
        return esClient.save(this.data, "shortly", "usage_info")
            .then(function (res) {
                return res;
            })
    } else {
        return new Promise(function (resolve, reject) {
            return {};
        });
    }
};

UsageInfo.getGeneralUsageInfo = function (req) {
    return new Promise(function (resolve, reject) {
        var userAgent = req.headers["user-agent"];
        var parser = new UAParser();
        parser.setUA(userAgent);
        resolve(parser.getResult());
    });
};

UsageInfo.getGeoInfo = function (req) {
    return new Promise(function (resolve, reject) {
        GeoIp.getGeoData(req.headers['x-forwarded-for'] || req._remoteAddress)
            .then(function (res) {
                resolve(res);
            }).catch(function (err) {
                app_logger.error("Unable to fetch geo info ", err);
                resolve({});
            });
    });
};

UsageInfo.get = function (req) {
    var join = Promise.join;
    return join(UsageInfo.getGeneralUsageInfo(req), UsageInfo.getGeoInfo(req),function (generalUsageInfo, geoInfo) {
        var usageInfo = {};
        usageInfo["generalUsage"] = generalUsageInfo;
        usageInfo["geoInfo"] = geoInfo;
        usageInfo["remoteIp"] = req.headers['x-forwarded-for'] || req._remoteAddress;
        return usageInfo;
    }).catch(function (err) {
            app_logger.error("Error in creating usage info ", err);
            return {};
        });
};

module.exports = UsageInfo;

