var app_logger = require("../logger/logger");
var Url = require("../model/url");
var UsageInfo = require("../model/usage_info");
var shortId = require('shortid');
var nodeUrl = require('url');
exports.generateShortURL = function (req, res) {
    var content = req.body;
    if (content.url) {
        content.url = nodeUrl.format(content.url);
        Url.isExisting(content.url)
            .then(function (resp) {
                sendExistingUrlDetails(resp, req, res);
            })
            .catch(function (resp) {
                saveShortUrl(content, req, res);
            })
            .catch(function (err) {
                sendErrorResponse(res, err);
            });
    } else {
        res.status(400).send({error: "request json should be in the format {\"url\":\"stayzilla.com\"} with optional slug"});
    }
};

exports.redirectShortUrl = function (req, res) {
    if (req.params && req.params.shortUrl) {
        Url.isSlugAvailable(req.params.shortUrl)
            .then(function (response) {
                saveUsageInfoAndRedirectTheUser(response, req, res);
            })
            .catch(function (err) {
                sendErrorResponse(res, err);
            });
    } else {
        res.status(400).send({error: "request should be in the format domain_name/[short_url]"});
    }
};

var saveUrlContents = function (req, originalUrl, slug, res, slugRespected) {
    var url = new Url({original_url: originalUrl, short_url: "http://short.ly/" + slug, slug: slug});
    url.save()
        .then(function (saveResp) {
            saveUsageInfo(req, saveResp._id);
            res.status(201).send({shortUrl: url.data.short_url, originalUrl: url.data.original_url, slugRespected: slugRespected});
        })
        .catch(function (err) {
            app_logger.error(err);
            res.send({error: "unable to generate short url"});
        });

};

var sendErrorResponse = function (res, err, message) {
    message = message || "unable to generate short url";
    res.status(500).send({error: message});
    app_logger.error("Error in generating short url with slug", err);
};

var saveWithSlug = function (req, content, res) {
    Url.isSlugAvailable(content.slug)
        .then(function (response) {
            if (response.hits.total === 0) {
                saveUrlContents(req, content.url, content.slug, res, true);
            } else {
                saveUrlContents(req, content.url, shortId.generate(), res, false);
            }
        })
        .catch(function (err) {
            sendErrorResponse(res, err);
        });
};

var saveUsageInfo = function (req, shortUrlId) {
    UsageInfo.get(req)
        .then(function (data) {
            data["shorturl_id"] = shortUrlId;
            var usageInfo = new UsageInfo(data);
            usageInfo.save();
        })
        .catch(function (err) {
            app_logger.error("Unable to save usage info ", err);
        });
};

function saveShortUrl(content, req, res) {
    if (content.slug) {
        saveWithSlug(req, content, res);
    } else {
        saveUrlContents(req, content.url, shortId.generate(), res, true);
    }
}
function sendExistingUrlDetails(resp, req, res) {
    var urlData = resp.hits.hits[0]._source;
    saveUsageInfo(req, resp.hits.hits[0]._id);
    res.status(200).send({shortUrl: urlData.short_url, originalUrl: urlData.original_url});
}

function saveUsageInfoAndRedirectTheUser(response, req, res) {
    var urlData = response.hits.hits[0]._source;
    app_logger.info("Redirecting to the url " + urlData.original_url);
    saveUsageInfo(req, response.hits.hits[0]._id);
    res.redirect(urlData.original_url);
}
