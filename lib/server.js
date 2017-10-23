'use strict';

var _require = require('./proxy_server'),
    createProxyServer = _require.createServer;

var DEFAULT_OPTIONS = {
  socks: '127.0.0.1:1080',
  proxyListReloadTimeout: 60,
  port: 3000
};

function createServer(opts) {
  var options = Object.assign({}, DEFAULT_OPTIONS, opts);
  var port = options.port,
      socks = options.socks;

  // eslint-disable-next-line

  console.log('SOCKS: ' + socks + '\nhttp-proxy listening: http://127.0.0.1:' + port);

  return createProxyServer(options).listen(port);
}

module.exports = {
  createServer: createServer
};