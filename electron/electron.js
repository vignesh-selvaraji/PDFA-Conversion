const path = require('path');
const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const createProtocol = require('./createProtocol')
const EXPRESS_SERVER = require('../src/express_server');
const { ipc_main_handler, ipc_proxy_call_handler, ipc_invoke_handler } = require("../src/ipcMainHandler")
const { bind_main_window_id_to_library, bind_main_window_to_library } = require("../src/library/library")
const { bind_main_window_id_to_ipchandler, bind_main_window_to_ipchandler } = require("../src/ipcMainHandler")

const partition = 'persist:app_session'
let g_mainBrowserWindow = null
let g_main_window_id = null
let g_windows = [];
let g_isLoginSuccess = false;
let g_UploadInProgress = false;
//
// ipc_invoke_handler
//
ipcMain.handle('ipc-invoke', async (event, arg) => {
  try {
    let test = ipc_invoke_handler(event, arg);
    if (arg.message === "updateappbusy") {
      g_UploadInProgress = arg.params.flag;
    }
    return test;
  } catch (e) {
    // loggerr.info('electron.js + ipc-invoke ', e);
    console.log("ipc-invoke : exception: " + JSON.stringify(e));
  }
})
//
// message-from-renderer
//
ipcMain.on('message-from-renderer', (event, arg) => {
  try {
    console.log(arg);
    ipc_main_handler(event, arg);
    if (arg.message === "login_status") {
      g_isLoginSuccess = arg.params.status;
    }
    else if (arg.message === "logout_status") {
      g_isLoginSuccess = false;
    }
    else if (arg.message === 'updateappbusy') {
      g_UploadInProgress = arg.params.flag;
    }
  } catch (e) {
    console.log("message-from-renderer : exception: " + JSON.stringify(e));
  }
});
ipcMain.on('message-from-renderer-for-proxy-call', (event, arg) => {
  try {
    console.log(arg.message);
    ipc_proxy_call_handler(event, arg);
  } catch (e) {
    console.log("message-from-renderer-for-proxy-call : exception: " + JSON.stringify(e));
  }
});

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

function createWindow() {
  let icon = app.isPackaged ? path.join(process.resourcesPath, "src/assets/logo.png") : "src/assets/logo.png";
  if (process.platform === "darwin") {
    icon = app.isPackaged ? path.join(process.resourcesPath, "src/assets/logo.png") : "src/assets/logo.png";
  }
  const preloadurl = app.isPackaged ? path.join(process.resourcesPath, "electron/preload.js") : path.join(__dirname, 'preload.js');
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: preloadurl,
      partition: partition,
    },
    'icon': icon
  });

  createProtocol('app', partition);
  if (app.isPackaged) {
    mainWindow.loadURL('app://./index.html')
    //mainWindow.loadFile('./dist/index.html')
    //DEV Tools - comment below line before preparing production EXE.
    //mainWindow.webContents.openDevTools()
  }
  else {
    mainWindow.loadFile('./dist/index.html')

    if (!process.env.IS_TEST) {
      mainWindow.webContents.openDevTools()
    }
  }

  mainWindow.setMinimumSize(800, 728);
  mainWindow.removeMenu();

  g_main_window_id = mainWindow.id;
  bind_main_window_id_to_library(g_main_window_id);
  bind_main_window_id_to_ipchandler(g_main_window_id);
  g_mainBrowserWindow = mainWindow;
  bind_main_window_to_library(g_mainBrowserWindow);
  bind_main_window_to_ipchandler(g_mainBrowserWindow);

  g_mainBrowserWindow.hookWindowMessage(0x4A /* = WM_COPYDATA */, () => {
    console.log("electron.js hookWindowMessage started: ");
  });

}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
//
// lookupwindowByFramename
//
const lookupwindowByFramename = function (frameName) {
  //Due to unknown reason, got javascript error so as just in case
  try {
    for (let ii = 0; ii < g_windows.length; ii++) {
      if (g_windows[ii].frameName === frameName) {
        return g_windows[ii];
      }
    }
    return null;
  }
  catch (e) {
    console.log(e);
    return null;
  }
};
//
// lookupwindowByFramenameEx
//
//
// lookupwindowByFramenameAndRemoved
//
//
// lookupwindowByID
//
app.on('browser-window-created', async (eve, window) => {
  let window_frameName = "";
  let item_window = {};
  try {
    setTimeout(() => {
      window_frameName = window.title;
      item_window = {
        window: window,
        frameName: window_frameName,
        id: window.id
      }
      g_windows.push(item_window);
    }, 0);
  }
  catch (e) {
    console.log(e);
  }

  window.on('minimize', function () {
  });

  window.on('maximize', function () {
  });
  //
  //
  //
  window.on('close', function (close_event) {
    if (g_UploadInProgress === true) {
      window.webContents.send("appbusy", true);
      close_event.preventDefault();
    }
    else {
      app.quit();
    }
  });
  //
  // setWindowOpenHandler
  //
  window.webContents.setWindowOpenHandler(async (details) => {
    let icon = app.isPackaged ? path.join(process.resourcesPath, "src/assets/logo.png") : "src/assets/logo.png";
    if (process.platform === "darwin") {
      icon = app.isPackaged ? path.join(process.resourcesPath, "src/assets/logo.png") : "src/assets/logo.png";
    }

    let _active_windowNew = lookupwindowByFramename(details.frameName);
    if (_active_windowNew !== null) {
      _active_windowNew.window.show();
    }
  });
});
//
//
//
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  try {
    for (let iii = 0; iii < process.argv.length; iii++) {
      let process_arg = process.argv[iii];
      if (process_arg === "--close" || process_arg === "--install" || process_arg === "--uninstall" || process_arg === "--update") {
      }
    }
  }
  catch (e) {
    console.log(e);
  }
  setTimeout(function () {
    app.quit();
  }, 0);
}
else {
  let fCloseRequest = false;
  for (let iii = 0; iii < process.argv.length; iii++) {
    let process_argNew = process.argv[iii];
    if (process_argNew === "--close" || process_argNew === "--install" || process_argNew === "--uninstall" || process_argNew === "--update") {
      if (process_argNew === "--uninstall") { }
      if (process_argNew === "--install") { }
      if (process_argNew === "--update") { }
      console.log("process.argv argument : app close requested");
      fCloseRequest = true;
    }
  }
  if (fCloseRequest) {
    try {
      app.quit();
      //return;
    }
    catch (e) {
      console.log(e);
    }
  }

  let express_server = null;
  (async () => {
    try {
      express_server = await EXPRESS_SERVER.start_express();
      console.log("START express server as : " + express_server);
    }
    catch (e) {
      console.log(e);
    }
  })();
  process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('Closing http server.');
    express_server.close(() => {
      console.log('Http server closed.');
    });
  });
  process.on('uncaughtException', () => {
    console.info('uncaughtException signal received.');
    console.log('Closing http server.');
    express_server.close(() => {
      console.log('Http server closed.');
    });
  });
  console.log("runtime path:" + app.getPath('exe'));
}