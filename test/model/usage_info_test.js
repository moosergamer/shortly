var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonAsPromised = require('sinon-as-promised');
var expect = require('chai').expect

var esClient = require("../../bin/es_client");
var UsageInfo = require("../../model/usage_info");
var GeoIp = require("../../util/geoip");

describe("Save url usage information ", function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("should save usage info ", function (done) {
        var usageJson = {
            "generalUsage": {
                "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36",
                "browser": {
                    "name": "Chrome",
                    "version": "40.0.2214.111",
                    "major": "40"
                },
                "engine": {
                    "name": "WebKit",
                    "version": "537.36"
                },
                "os": {
                    "name": "Mac OS",
                    "version": "10.9.5"
                },
                "device": {},
                "cpu": {}
            },
            "geoInfo":{
                "latitude":12.13432432,
                "longitude":78.235235,
                "country": "IN"
            }
        };
        var esMock = sandbox.mock(esClient);
        esMock.expects("save").resolves({_id:"124134",created:true});
        var usageInfo = new UsageInfo(usageJson);
        usageInfo.save().then(function(result){
            expect(result).to.have.property("_id");
            expect(result._id).to.equal("124134");
            expect(result).to.have.property("created");
            expect(result.created).to.equal(true);
            esMock.verify();
            done();
        });
    });

    it("should get all the usage info", function(done){
        var uastring = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.10 Chromium/15.0.874.106 Chrome/15.0.874.106 Safari/535.2";
        var req = {headers:{"user-agent":uastring},"_remoteAddress":"46.19.37.108"};
        var geoJson = {"longitude":4.9,"latitude":52.3667,"asn":"AS196752","offset":"2","ip":"46.19.37.108","area_code":"0","continent_code":"EU","dma_code":"0","timezone":"Europe\/Amsterdam","country_code":"NL","isp":"Tilaa B.V.","country":"Netherlands","country_code3":"NLD"};
        var geoMock = sandbox.mock(GeoIp);
        var expectedOutput = usageInfoOutput();
        geoMock.expects("getGeoData").withArgs("46.19.37.108").resolves(geoJson);
        UsageInfo.get(req).then(function(res){
            expect(Object.keys(res).length).to.equal(3);
            expect(res).to.have.property("generalUsage");
            expect(res).to.have.property("geoInfo");
            expect(res).to.have.property("remoteIp");
            expect(res.toString()).to.equal(expectedOutput.toString());
            done();
        });
    });

    function usageInfoOutput(){
        return { generalUsage:
        { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.10 Chromium/15.0.874.106 Chrome/15.0.874.106 Safari/535.2',
            browser: { name: 'Chromium', version: '15.0.874.106', major: '15' },
            engine: { name: 'WebKit', version: '535.2' },
            os: { name: 'Ubuntu', version: '11.10' },
            device: { model: undefined, vendor: undefined, type: undefined },
            cpu: { architecture: 'amd64' } },
            geoInfo:
            { longitude: 4.9,
                latitude: 52.3667,
                asn: 'AS196752',
                offset: '2',
                ip: '46.19.37.108',
                area_code: '0',
                continent_code: 'EU',
                dma_code: '0',
                timezone: 'Europe/Amsterdam',
                country_code: 'NL',
                isp: 'Tilaa B.V.',
                country: 'Netherlands',
                country_code3: 'NLD' } };
    }
});