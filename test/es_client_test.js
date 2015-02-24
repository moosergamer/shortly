var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonAsPromised = require('sinon-as-promised');
var expect = require('chai').expect

var esClient = require("../bin/es_client");

describe("Given a document index and type ", function () {
    this.timeout(5000);
    beforeEach(function (done) {
        esClient.flushAll("test_index", "sample_type").then(function (result) {
            done();
        });
    });

    it("should save the document into elastic search ", function (done) {
        var doc = {original_url: "http://originalurl.com/asdf34", short_url: "http://short.ly/xyz", slug: "xyz"};
        esClient.save(doc, "test_index", "sample_type").then(function (result) {
            expect(result).to.have.property("_id");
            expect(result._id.length > 0).to.equal(true);
            done();
        }).done(null, done);
    });

    it("should fetch the document for a given key and value ", function (done) {
        var doc = {original_url: "http://originalurl.com/asdf34", short_url: "http://short.ly/xyz", slug: "xyz"};
        esClient.save(doc, "test_index", "sample_type").then(function (result) {
            expect(result).to.have.property("_id");
            expect(result._id.length > 0).to.equal(true);
            esClient.fetchBy("slug", "xyz", "test_index", "sample_type").then(function (resultsByKey) {
                expect(resultsByKey).to.have.property("hits");
                done();
            });

        }).done(null, done);

    });
});
