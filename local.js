const TCPRelay = require('./tcprelay').TCPRelay;
const constants = require('./constants');
const local = require('commander');
const config = require('./config.json');

var relay = new TCPRelay(config, true);
relay.setLogLevel(local.logLevel);
relay.setLogFile(local.logFile);
relay.bootstrap();