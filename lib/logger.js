'use strict';

var winston = require('winston');

var Logger = winston.Logger,
    transports = winston.transports;
var Console = transports.Console;


var DEFAULT_COMMON_OPTIONS = {
  colorize: true,
  timestamp: true
};

function createTransports() {
  return [new Console(Object.assign({}, DEFAULT_COMMON_OPTIONS))];
}

function createLogger() {
  var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'warn';

  return new Logger({
    level: level,
    transports: createTransports()
  });
}

function changeLevel(logger, level) {
  logger.configure({
    level: level,
    transports: createTransports()
  });
}

var logger = createLogger();

module.exports = {
  logger: logger,
  createLogger: createLogger,
  changeLevel: changeLevel
};