var Promise = require('bluebird');
var esClient = require('../bin/es_client');
var app_logger = require("../logger/logger");
var Url = function (data) {
    this.data = data;
};


Url.prototype.data = {};

Url.prototype.save = function () {
return esClient.save(this.data, "shortly", "shorturl")
        .then(function (res) {
            return res;
        })
        .catch(function (err) {app_logger.error(err)});
};

Url.isSlugAvailable = function (slug) {
    return new Promise(function (resolve, reject) {
        esClient.fetchBy('slug', slug).then(function (resp) {
            resolve(resp);
        }).catch(function (err) {
                app_logger.error("Error in fetching slug details", err);
                reject(err);
            });
    });
};

Url.isExisting = function(url){
    return new Promise(function(resolve, reject){
        esClient.fetchBy("original_url", url)
            .then(function(resp){
                if(resp.hits.total > 0){
                    resolve(resp);
                }else{
                    reject({results:0});
                }
            });
    });
};
module.exports = Url;