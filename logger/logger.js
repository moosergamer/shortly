var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'trade-processor', streams: [
    {
        type: 'rotating-file',
        path: "shortly.log",
        period: '1d',
        count: 10
    }
],
    serializers: bunyan.stdSerializers
});
module.exports = log;