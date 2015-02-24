var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var expect = require('chai').expect
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var sinonAsPromised = require('sinon-as-promised');

var urlController = require("../../controllers/url_controller");
var Url = require("../../model/url");
var UsageInfo = require("../../model/usage_info");
var esClient = require('../../bin/es_client');
//var clock = sinon.useFakeTimers();

describe('Generate short url or redirect if a short url is given', function () {
    this.timeout(2000);
    var sandbox;
    var res = {};
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        res = {status: function (statusCode) {
                            this.statusCode = statusCode;return res;
                            },
               send:   function (message) {
                            this.responseMessage = message;return message;
                            },
               redirect:   function (message) {
                            this.responseMessage = message;return message;
                            },
               statusCode: 0,
               responseMessage: ""};
    });

    afterEach(function () {
        sandbox.restore();
        res = {};
    });

    it('should redirect to the original url if the short url is present in our system', function (done) {
        var req = {};
        req['params'] = {};
        req['params']['shortUrl'] = "Xzwtysz";
        sandbox.stub(Url, "isSlugAvailable").resolves({hits: {hits: [
            {_source: {original_url: "www.xyz.com"}, _id: "ABCDEFGHI"}
        ]}});
        sandbox.stub(UsageInfo, "get").resolves({});
        sandbox.stub(esClient, "save").resolves({});
        urlController.redirectShortUrl(req, res);
        setTimeout(function () {
            expect(res.responseMessage).to.equal("www.xyz.com");
            done();
        }, 10);
    });

    it('should fail with 400 error if short url parameter is not sent as part of the request', function (done) {
        var req = {};
        req['params'] = {};
        urlController.redirectShortUrl(req, res);
        setTimeout(function () {
            expect(res.statusCode).to.equal(400);
            expect(res.responseMessage).to.have.property("error");
            done();
        }, 10);

    });

    it('Given a original/long url without optional slug, and provided short url is not generated before, ' +
        'a new short url need to be generated and saved', function (done) {
        var req = {body: {url: "www.happyweekend.com"}};
        stubAllRequiredMethodsInUrlSave();
        urlController.generateShortURL(req, res);
        setTimeout(function () {
            generalExpectationsForUrlSave(res);
            expect(res.responseMessage.originalUrl).to.equal("www.happyweekend.com");
            done()
        }, 20);
    });

    it('Given a original/long url with slug, and provided short url is not generated before, ' +
        'a new short url needs to be generated and saved', function(done){
        var req = {body: {url: "www.happyweekend.com",slug:"abcdefg"}};
        stubAllRequiredMethodsInUrlSave();
        sandbox.stub(Url, "isSlugAvailable").withArgs("abcdefg").resolves({hits:{total:0}});
        urlController.generateShortURL(req, res);
        setTimeout(function () {
            generalExpectationsForUrlSave(res);
            expect(res.responseMessage.originalUrl).to.equal("www.happyweekend.com");
            expect(res.responseMessage.shortUrl).to.equal("http://short.ly/abcdefg");
            done()
        }, 20);

    });
    it('Given a original/long url with/without slug, and provided short url is already generated before, ' +
        'should fetch the existing respond with existing short url details instead of re saving', function(done){
        var longUrl = "www.happyweekend.com";
        var req = {body: {url: longUrl,slug:"abcdefg"}};
        var esResponse = {hits:{hits:[{_source:{short_url:"abcdefg",original_url:longUrl},_id:"12345"}]}};
        sandbox.stub(UsageInfo, "get").resolves({});
        sandbox.stub(Url, "isExisting").withArgs(longUrl).resolves(esResponse);
        urlController.generateShortURL(req, res);
        setTimeout(function(){
            expect(res.statusCode).to.equal(200);
            expect(res.responseMessage).to.have.property("shortUrl");
            expect(res.responseMessage).to.have.property("originalUrl");
            expect(Object.keys(res.responseMessage).length).to.equal(2);
            done();
        },20)

    });
    function stubAllRequiredMethodsInUrlSave(url) {
        url = url || "www.happyweekend.com";
        sandbox.stub(UsageInfo, "get").resolves({});
        sandbox.stub(Url, "isExisting").withArgs(url).rejects({});
        sandbox.stub(esClient, "save").resolves({});
    }

    function generalExpectationsForUrlSave(res, statusCode) {
        statusCode = statusCode || 201;
        expect(res.statusCode).to.equal(statusCode);
        expect(res.responseMessage).to.have.property("shortUrl");
        expect(res.responseMessage).to.have.property("originalUrl");
        expect(res.responseMessage).to.have.property("slugRespected");
        expect(Object.keys(res.responseMessage).length).to.equal(3);
    }


});