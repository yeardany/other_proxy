const electron = require('electron');
const app = electron.app;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const local = require('commander');

const TCPRelay = require('./tcprelay').TCPRelay;
const config = require('./config.json');

let win;

app.on('ready', () => {

    //连接服务器
    let relay = new TCPRelay(config, true);
    relay.setLogLevel(local.logLevel);
    relay.setLogFile(local.logFile);
    relay.bootstrap();

    //主线程错误处理
    process.on('uncaughtException', function (error) {
        dialog.showMessageBox({
            type: 'error',
            buttons: ['好的'],
            message: `出错啦 O__O "…\n${error}`
        }, function () {
            app.quit();
        })
    });

    //新建窗口
    win = new BrowserWindow(
        {
            width: 875,
            height: 735,
            resizable: false,
            maximizable: false,
            fullscreenable: false,
            title: 'KIRS',
            backgroundColor: '#fff'
        }
    );

    //加载远程连接
    //win.loadURL('https://www.baidu.com');

    // 打开开发者工具。
    //win.webContents.openDevTools();

    //加载本地文件
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    //退出
    win.on('closed', () => {
        app.quit()
    });

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});
