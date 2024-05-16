const electron = require('electron')
// 控制应用程序生命周期的模块
const app = electron.app
// 创建原生浏览器窗口的模块
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain

const menu = electron.Menu

const path = require('path')
const url = require('url')
var close = false;

// 保持窗口对象的全局引用，如果不保持引用，窗口将在 JavaScript 对象被垃圾收集时自动关闭。
let mainWindow

function createWindow () {
  // 创建浏览器窗口。
  mainWindow = new BrowserWindow({width:930, height:700, frame:false})


  // 加载应用的 index.html。
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // 打开开发者工具。
  // mainWindow.webContents.openDevTools()
  // mainWindow.setMenu(null)
  // 当窗口关闭时触发。
  mainWindow.on('closed', function () {
    // 取消引用窗口对象，通常情况下你会把多个窗口存放在数组中，
    // 与此同时，你应该删除相应的元素。
    mainWindow = null
  })

  mainWindow.on('close', (event) => {
    if (!close) {
      event.preventDefault();
      mainWindow.webContents.send('save' , {msg:'主进程发送的消息'});
    }
  })
}

ipcMain.on('exit', () => {
  close = true;
  app.quit()
})
// 当 Electron 完成初始化并准备创建浏览器窗口时，将调用此方法。
// 某些 API 只能在此事件发生后才能使用。
app.on('ready', () => {
  createWindow()
  if (process.platform === 'darwin') {
    var template = [{
      label: 'FromScratch',
      submenu: [{
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        click: function() { app.quit(); }
      }]
    }, {
      label: '编辑',
      submenu: [{
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        selector: 'undo:'
      }, {
        label: '重做',
        accelerator: 'Shift+CmdOrCtrl+Z',
        selector: 'redo:'
      }, {
        type: 'separator'
      }, {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        selector: 'cut:'
      }, {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        selector: 'copy:'
      }, {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        selector: 'paste:'
      }, {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:'
      }]
    }];
    var osxMenu = menu.buildFromTemplate(template);
    menu.setApplicationMenu(osxMenu);
  }
})

// 当所有窗口都关闭时退出应用。
app.on('window-all-closed', function () {
  // 在 macOS 上，通常用户在明确地按下 Cmd + Q 之前，应用会保持活动状态
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (mainWindow === null) {
    createWindow()
  }
})

// 在此文件中，你可以包含应用程序的其余特定主进程代码。
// 你还可以将它们放在单独的文件中，并在此处 require 进来。
