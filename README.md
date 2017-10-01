#### 使用说明

1. 安装依赖：`npm install`，使用 `cnpm` 全局安装 electron@1.6.3 和 electron-package

2. 打包MacApp：`npm run-script package` ，将输出目录`out` 下的 `Kirs.app` 复制到**应用程序**下打开即可

3. 打包Windows安装包：

   ```javascript
   //安装依赖
   brew install wine //安装wine，如提示安装其他依赖，依次安装
   npm install gulp -g //全局安装gulp
   npm install electron-windows-inno-installer -g //全局安装打包器

   //打包
   electron-windows-inno-installer ./setup.iss --platform win32-x64 --icon ./icon.ico
   ```
    
