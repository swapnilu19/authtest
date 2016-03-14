var parser = require('node-ini');
module.exports = parser.parseSync(__dirname+'/config.ini');
