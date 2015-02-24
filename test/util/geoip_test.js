var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonAsPromised = require('sinon-as-promised');
var expect = require('chai').expect

var GeoIp = require("../../util/geoip");

describe("Fetch geo information based on ip ",function(){
    this.timeout(10000);
    it("should use external provider http://www.telize.com/ to get information", function(done){
        GeoIp.getGeoData("46.19.37.108").then(function(res){
            res = JSON.parse(res);
            expect(res).to.have.property("longitude");
            expect(res).to.have.property("latitude");
            done();
        });
    });
});