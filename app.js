const local = require('commander'),
    TCPRelay = require('./tcprelay').TCPRelay,
    httpProxy = require('./lib/cli');

//启动sockets5代理
let relay = new TCPRelay({
    "localAddress": "127.0.0.1",
    "localPort": 1080,
    "serverAddress": "rammy.herokuapp.com",
    "serverPort": 80,
    "password": "963747",
    "method": "aes-256-cfb"
}, true);
relay.setLogLevel(local.logLevel);
relay.setLogFile(local.logFile);
relay.bootstrap();
//启动http代理
httpProxy.main();
