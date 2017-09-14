const electron = require('electron');
const app = electron.app;
const net = electron.net;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const local = require('commander');

const TCPRelay = require('./tcprelay').TCPRelay;
//const config = require('./config.json');

let win;

app.on('ready', () => {
    const request = net.request('https://kirs.leanapp.cn/movies/config');
    request.on('response', (response) => {
        console.log(`STATUS: ${response.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
        response.on('data', (chunk) => {
            if (!chunk) return;
            let relay = new TCPRelay(chunk, true);
            relay.setLogLevel(local.logLevel);
            relay.setLogFile(local.logFile);
            relay.bootstrap();
            //console.log(`BODY: ${chunk}`)
        });
        response.on('end', () => {
            console.log('No more data in response.')
        })
    });

    request.end();

    win = new BrowserWindow(
        {
            width: 700,
            height: 600,
            resizable: false,
            maximizable: false,
            fullscreenable: false,
            title: 'KIRS',
            backgroundColor: '#fff'
        }
    );

    //加载远程连接
    //win.loadURL('https://kirs.leanapp.cn');

    //加载本地文件
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.on('closed', () => {
        app.quit()
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
