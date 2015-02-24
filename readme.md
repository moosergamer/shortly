# short.ly - url shortener

**Description**
This project helps you to generate short urls for a given url. As part of the short url generation, client has an option
of sending an optional "slug" which will be tried to use before generating a random slug.

Once the short url is accessed, user would be redirected to the corresponding website.

**Play with a running instance**
A running instance of this app is deployed on heroku. You can access it [here](http://getshort.herokuapp.com/).
The first request to the app might be slow as it is running with free tier on heroku. See the *API* section to understand the different api's to use.

**Setting up the project**
This is a simple express based nodejs app. It uses bluebird for promise based callbacks(to avoid callback hells).
Some more interesting libraries used are lodash(collection utility), forever(to restart the node instances in case of failures),
bunyan(json based logger), short-id(unique short id generation library), ua-parser-js(analyses the user agent and generates some info).

Unit testing is done by using chai, cahi-as-promised, sinon, sinon-as-promised and mocha. Sinon is used for mocking & stubbing.

Elastic search is used as the data store to store all the short url details and the usage information.

1. Install node - if you are on mac, `brew install node` should do the install.
2. Install elasticsearch - again if you are on mac 'brew install elasticsearch' should help.
3. run `npm install` on the root directory to download all the dependencies.
4. There are two ways to run all the unit tests. Either use `mocha` command on the root directory or use `npm test`.
5. Two start the server use `npm start`. This command should create required elastic search mappings and then start the server.
6. Once the setup is done for the next time runs you can chose to use `setupAndStart.sh` on the root folder.

**API**
There re two different api's
1. *POST* request to generate short url.
2. *GET* request To access short url which redirect the user to the original website.

Request usage is being tracked(more about it in the following sections)

### Generating Short Url
If you are running this application locally, you can access the api at `http://localhost:3000/shortly`.
Below is the curl request to represent the same.

*Example1 without slug*
```
curl -X POST -H "Content-Type: application/json" -d '{"url":"http://www.oneandonlylengthiestwebsiteyoucaneversee.com/remember"}' http://localhost:3000/shortly
```

Output for the above curl request will look like
```
{"shortUrl":"http://localhost:3000/Q1RZegyd","originalUrl":"http://www.oneandonlylengthiestwebsiteyoucaneversee.com/remember","slugRespected":false}
```

*Example2 with slug*
```
curl -X POST -H "Content-Type: application/json" -d '{"url":"http://www.littlebiggerwebsite.com/remember","slug":"small"}' http://localhost:3000/shortly
```

Output for the above curl request will look like. "slugRespected" will return false if the slug asked for is already taken
```
{"shortUrl":"http://localhost:3000/small","originalUrl":"http://www.littlebiggerwebsite.com/remember","slugRespected":true}
```

### Retrieving the short URL
If you are running the application locally, you can send the short url request to `http://localhost:300`.
Below is the curl request  demonstrating the same.

```
curl -X GET -H "Content-Type: application/json" http://localhost:3000/Q1RZegyd
```
Response for the above curl request would be
```
Moved Temporarily. Redirecting to http://www.oneandonlylengthiestwebsiteyoucaneversee.com/remember
```
*Internal representation of data in elastic search*
```
{
  "_index": "shortly",
  "_type": "shorturl",
  "_id": "AUu8R_LsKBGmE_eRwB91",
  "_score": 1,
  "_source": {
    "original_url": "http://www.lastminute.com/one-more",
    "short_url": "http://getshort.herokuapp.com/QytkU0RP",
    "slug": "QytkU0RP",
    "created_at": "2015-02-24T15:50:06+00:00"
  }
}
```
### Usage Information
There's lot of usage information which is being stored as part of the url requests. Below is the brief excerpt of
the information that is being captured as part of the api usage. The below information represents the usage info for the
short url with id `"shorturl_id": "AUu8LZeWKBGmE_eRwB8d"`
```
    "generalUsage": {
      "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36",
      "browser": {
        "name": "Chrome",
        "version": "40.0.2214.115",
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
    "geoInfo": {"longitude":77,"latitude":20,"asn":"AS9829","offset":"5","ip":"59.99.32.245","area_code":"0","continent_code":"AS","dma_code":"0","timezone":"Asia\/Kolkata","country_code":"IN","isp":"National Internet Backbone","country":"India","country_code3":"IND"}",
    "remoteIp": "59.99.32.245",
    "shorturl_id": "AUu8LZeWKBGmE_eRwB8d",
    "created_at": "2015-02-24T15:21:19+00:00"
```

**Technology Choices**
As this is the short url generation system, number of requests which this system needs to handle is extremely high.
At a high level though the data looks like a structured one, there's a huge provision of storing lot of unstructured data
along with the short url generation. Ex: Usage Information can be completely unstructured. Based on the above two considerations,
I chose node as development language and the elatsicsearch as the data store. One more reason to use elasticsearch as
data store is the power of random search to generate lot of usage metrics. Because of the inverted indexing nature of
elasticsearch(lucene), free flow text search will be extremely fast.

To ease the development and debugging, some specific libraries like bluebird, express, bunyan, moment, lodash, forever are used.
Bluebird helps in aiding promise based coding and avoids the callback hell, which is pretty common in the node based
applications.

Though a complete acceptance test suite is not wrriten, basic unit test suite is running on top of mocha, chai and sinon.
Sinon is the preferred mocking & stubbing library, which is used in conjuction with BDD style chai expectations and mocha
based test framework. For most of the test libraries, their enhanced promise based versions are used to facilitate easy
testing of promise based code.

**Scope of future work**
1. Expose some apis to get the usage information based on different attributes.
2. Create a dashboard which shows usage statistics based on browsers, geo location, referrers, operating systems, devices, etc,.
3. Write a complete automation suite to test the apis end to end. Currently controllers are only unit tested.

