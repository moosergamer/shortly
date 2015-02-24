var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonAsPromised = require('sinon-as-promised');
var expect = require('chai').expect

var esClient = require("../../bin/es_client");
var Url = require("../../model/url");

describe("Save and fetch from Url", function(){
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("should be able to save url data ", function(done){
        var url = new Url({original_url: "http://backstreet.com/yoyo", short_url: "http://short.ly/xyzabc" , slug: "xyzabc"});
        var esMock = sandbox.mock(esClient);
        esMock.expects("save").resolves({_id:"124134",created:true});
        url.save().then(function(result){
            expect(result).to.have.property("_id");
            expect(result._id).to.equal("124134");
            expect(result).to.have.property("created");
            expect(result.created).to.equal(true);
            esMock.verify();
            done();
        });
    });

    it("should check if the slug is already available ", function(done){
        var slug = "xyzabc";
        var esMock = sandbox.mock(esClient);
        esMock.expects("fetchBy").withArgs('slug', slug, "shortly", "shorturl").resolves({_hits:1});
        Url.isSlugAvailable(slug).then(function(res){
            expect(res).to.have.property("_hits");
            expect(res._hits).to.equal(1);
            esMock.verify();
            done();
        });
    });

    it("should check if the long url is already existing ", function(done){
        var longUrl = "http://mademydaycom";
        var esMock = sandbox.mock(esClient);
        esMock.expects("fetchBy").withArgs("original_url", longUrl, "shortly", "shorturl").resolves({_hits:1,hits:{total:1}});
        Url.isExisting(longUrl).then(function(res){
            expect(res).to.have.property("_hits");
            expect(res._hits).to.equal(1);
            esMock.verify();
            done();
        });
    });

});