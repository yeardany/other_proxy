'use strict';

// inspired by https://github.com/asluchevskiy/http-to-socks-proxy
var util = require('util');
var url = require('url');
var http = require('http');
var fs = require('fs');
var Socks = require('socks');

var _require = require('./logger'),
    logger = _require.logger;

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getProxyObject(host, port, login, password) {
  return {
    ipaddress: host,
    port: parseInt(port, 10),
    type: 5,
    authentication: { username: login || '', password: password || '' }
  };
}

function parseProxyLine(line) {
  var proxyInfo = line.split(':');

  if (proxyInfo.length !== 4 && proxyInfo.length !== 2) {
    throw new Error('Incorrect proxy line: ' + line);
  }

  return getProxyObject.apply(this, proxyInfo);
}

function requestListener(getProxyInfo, request, response) {
  logger.info('request: ' + request.url);

  var proxy = getProxyInfo();
  var ph = url.parse(request.url);

  var socksAgent = new Socks.Agent({
    proxy: proxy,
    target: { host: ph.host, port: ph.port }
  });

  var options = {
    port: ph.port,
    hostname: ph.hostname,
    method: request.method,
    path: ph.path,
    headers: request.headers,
    agent: socksAgent
  };

  var proxyRequest = http.request(options);

  proxyRequest.on('error', function (error) {
    logger.error(error.message + ' on proxy ' + proxy.ipaddress + ':' + proxy.port);
    response.writeHead(500);
    response.end('Connection error\n');
  });

  proxyRequest.on('response', function (proxyResponse) {
    proxyResponse.pipe(response);
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
  });

  request.pipe(proxyRequest);
}

function connectListener(getProxyInfo, request, socketRequest, head) {
  logger.info('connect: ' + request.url);

  var proxy = getProxyInfo();

  var ph = url.parse('http://' + request.url);
  var host = ph.hostname,
      port = ph.port;


  var options = {
    proxy: proxy,
    target: { host: host, port: port },
    command: 'connect'
  };

  Socks.createConnection(options, function (error, socket) {
    if (error) {
      // error in SocksSocket creation
      logger.error(error.message + ' connection creating on ' + proxy.ipaddress + ':' + proxy.port);
      socketRequest.write('HTTP/' + request.httpVersion + ' 500 Connection error\r\n\r\n');
      return;
    }

    // tunneling to the host
    socket.pipe(socketRequest);
    socketRequest.pipe(socket);

    socket.write(head);
    socketRequest.write('HTTP/' + request.httpVersion + ' 200 Connection established\r\n\r\n');
    socket.resume();
  });
}

function ProxyServer(options) {
  var _this = this;

  // TODO: start point
  http.Server.call(this, function () {});

  this.proxyList = [];

  if (options.socks) {
    // stand alone proxy loging
    this.loadProxy(options.socks);
  } else if (options.socksList) {
    // proxy list loading
    this.loadProxyFile(options.socksList);
    if (options.proxyListReloadTimeout) {
      setInterval(function () {
        _this.loadProxyFile(options.socksList);
      }, options.proxyListReloadTimeout * 1000);
    }
  }

  this.addListener('request', requestListener.bind(null, function () {
    return randomElement(_this.proxyList);
  }));
  this.addListener('connect', connectListener.bind(null, function () {
    return randomElement(_this.proxyList);
  }));
}

util.inherits(ProxyServer, http.Server);

ProxyServer.prototype.loadProxy = function loadProxy(proxyLine) {
  try {
    this.proxyList.push(parseProxyLine(proxyLine));
  } catch (ex) {
    logger.error(ex.message);
  }
};

ProxyServer.prototype.loadProxyFile = function loadProxyFile(fileName) {
  var self = this;

  logger.info('Loading proxy list from file: ' + fileName);

  fs.readFile(fileName, function (err, data) {
    if (err) {
      logger.error('Impossible to read the proxy file : ' + fileName + ' error : ' + err.message);
      return;
    }

    var lines = data.toString().split('\n');
    var proxyList = [];
    for (var i = 0; i < lines.length; i += 1) {
      if (!(lines[i] !== '' && lines[i].charAt(0) !== '#')) {
        try {
          proxyList.push(parseProxyLine(lines[i]));
        } catch (ex) {
          logger.error(ex.message);
        }
      }
    }
    self.proxyList = proxyList;
  });
};

module.exports = {
  createServer: function createServer(options) {
    return new ProxyServer(options);
  },
  requestListener: requestListener,
  connectListener: connectListener,
  getProxyObject: getProxyObject,
  parseProxyLine: parseProxyLine
};