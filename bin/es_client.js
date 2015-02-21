var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');
var app_logger = require("../logger/logger");
var moment = require("moment");

var getEsClient = function () {
    app_logger.info("Trying to fetch es client for " + process.env.NODE_ENV || 'localhost:9200');
    var host = process.env.NODE_ENV === "production" ? process.env.BONSAI_URL : 'localhost:9200';
    return new elasticsearch.Client({
        host: host
    });
};
exports.getClient = getEsClient;

exports.save = function (doc, indexName, type) {
    return new Promise(function (resolve, reject) {
        doc.created_at = moment().format();
        getEsClient().index({
            index: indexName,
            type: type,
            requestTimeout: 5000000,
            body: doc
        }, function (error, response) {
            if (error) {
                app_logger.error("Error in saving the doc ", error);
                reject(error);
            } else {
                app_logger.info("inserted doc for ", type);
                resolve(response);
            }
        });

    });

};

exports.fetchBy = function (key, value) {
    var keyValue = {};
    keyValue[key] = value;
    return new Promise(function (resolve, reject) {
        var client = getEsClient();
        app_logger.info("Fetching by key and value", key, value);
        var options = {
            index: "shortly",
            type: "shorturl",
            body: {
                "query": {
                    "filtered": {
                        "filter": {
                            "term": {

                            }
                        }
                    }
                }
            }
        };
        options["body"]["query"]["filtered"]["filter"]["term"] = keyValue;
        client.search(options).then(function (resp) {
            resolve(resp);
        }).catch(function (err) {
                reject(err);
            });
    })
};

