var esClient = require('./es_client');
var Promise = require('bluebird');
var app_logger = require("../logger/logger");

exports.createIndexAndAddMapping = function () {
    return new Promise(function (resolve, reject) {
        var mapping = {
            "index": "shortly",
            "type": "shorturl",
            "body": {
                "properties": {
                    "original_url": {"type": "string", "index": "not_analyzed" },
                    "short_url": {"type": "string", "index": "not_analyzed" },
                    "slug": {"type": "string", "index": "not_analyzed" }
                }
            }};
        createIndex().then(function (res) {
            esClient.getClient().indices.putMapping(mapping, function (err, res) {
                if (err) {
                    app_logger.error("Error in creating mapping ", err);
                    reject(err);
                } else {
                    console.log("Successfully added mapping");
                    app_logger.info("Created mapping ");
                    resolve(res);
                }
            })
        }).catch(function (err) {
                console.log(err);
            });
    });
};

var createIndex = function () {
    return new Promise(function (resolve, reject) {
        esClient.getClient().indices.exists({index: "shortly"}, function (err, res) {
            if (err) {
                reject(err);
            } else if (res) {
                console.log("\"shortly\" Index already exists");
                resolve(res);
            } else {
                esClient.getClient().indices.create({index: "shortly"}, function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("Successfully create index with name \"shortly\"");
                        resolve(res);
                    }
                });
            }
        });

    });

};