'use strict'
//
const { dialog, BrowserWindow } = require('electron');
const { get_language } = require('./library/library.js');
const { createresultdir, CheckPDFAfile, checkGhostscript, pdfafileconversionusingGhostScript } = require('./library/library.js');
//
let g_main_window_id = null;
let g_express_server_port = -1;

//
// bind_main_window_id_to_ipchandler
//
module.exports.bind_main_window_id_to_ipchandler = function (id) {
  g_main_window_id = id;
}
//
//
//
let g_main_window = null;
module.exports.bind_main_window_to_ipchandler = function (mainwin) {
  g_main_window = mainwin;
}
module.exports.bind_express_port_to_ipchandler = function (port) {
  g_express_server_port = port;
}
//
// ipc_invoke_handler
//
module.exports.ipc_invoke_handler = async function (event, arg) {
  console.log("ipc_invoke_handler : " + JSON.stringify(arg));
  const message = arg.message;
  try {
    if (message === "get_language") {
      return get_language();
    }
    else if (message === "getplatform") {
      return process.platform;
    }
    else if (message === "operation_open_dialog_touploadcustomfiles") {
      const options = {
        title: "",
        properties: ['openFile', 'singleSelections'],
        filters: [{ name: 'custom files', extensions: arg.params.extensionparams }]
      }
      const win = BrowserWindow.getFocusedWindow();
      const selected = dialog.showOpenDialogSync(win, options);
      if (typeof (selected) === "undefined" || !Array.isArray(selected) || selected.length <= 0) {
        return { canceled: true }
      }
      return { canceled: false, selectedItems: selected };
    }
    else if (message === "CheckPDFAfile") {
      let CheckPdfType = await CheckPDFAfile(arg);
      return CheckPdfType;
    }
    else if (message === "pdfafileconversion") {
      let result_json = await pdfafileconversionusingGhostScript(arg);
      return result_json;
    }

    else if (message === "createresultdir") {
      const result_json = await createresultdir(arg.params.dir_name, arg.params.filepath);
      return result_json;
    }
    else if (message === "checkGhostscript") {
      let result = await checkGhostscript();
      return result;
    }
  }
  catch (e) {
    console.log("ipc_invoke_handler : exception" + JSON.stringify(e));
  }
}