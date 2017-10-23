'use strict';

var _require = require('fs'),
    readFileSync = _require.readFileSync;

var _require2 = require('path'),
    resolve = _require2.resolve;

var cli = require('commander');

var _require3 = require('../package.json'),
    version = _require3.version;

var _require4 = require('./server'),
    createServer = _require4.createServer;

var _require5 = require('./logger'),
    logger = _require5.logger,
    changeLevel = _require5.changeLevel;

var optionNames = ['socks', 'port', 'level', 'config'];

function getFileConfig(filePath) {
  var absFile = resolve(process.cwd(), filePath);

  var content = readFileSync(absFile).toString('utf8');

  var fileConfig = null;

  try {
    fileConfig = JSON.parse(content);
  } catch (err) {
    var error = new Error('invalid json content: ' + err.message);
    error.code = err.code;
    throw error;
  }

  return fileConfig;
}

function getOptionsArgs(args) {
  var options = {};

  optionNames.forEach(function (name) {
    if (Object.hasOwnProperty.apply(args, [name])) {
      if (typeof args[name] !== 'string') {
        throw new Error('string "' + name + '" expected');
      }
      options[name] = args[name];
    }
  });

  return options;
}

function main() {
  cli.version(version).option('-s, --socks [socks]', 'specify your socks proxy host, default: 127.0.0.1:1080').option('-p, --port [port]', 'specify the listening port of http proxy server, default: 8080').option('-c, --config [config]', 'read configs from file in json format').option('--level [level]', 'log level, vals: info, error').parse(process.argv);

  var options = getOptionsArgs(cli);

  var fileConfig = null;

  if (options.config) {
    fileConfig = getFileConfig(options.config);
  }

  Object.assign(options, fileConfig);

  if (typeof options.level === 'string') {
    changeLevel(logger, options.level);
  }

  createServer(options);
}

module.exports = {
  getOptionsArgs: getOptionsArgs,
  main: main
};