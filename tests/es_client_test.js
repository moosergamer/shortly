var esClient = require("../bin/es_client");
var Url = require("../model/url");
var GeoIp = require("../util/geoip");

//esClient.fetchBy("original_url","stayzilla.com").then(function(res){console.log(res)});

//var url = new Url({a:1});
//
//url.save();

GeoIp.getGeoData("46.19.37.108");