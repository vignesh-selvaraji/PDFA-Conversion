// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld(
    'ipcRenderer',
    {
/*
Important note: This will get it working, 
but I'm going to make multiple methods for 
each time I'm using this to heighten security.
https://www.electronjs.org/docs/tutorial/context-isolation#security-considerations
*/
      send: (channel, arg) => ipcRenderer.send(channel, arg),
      sendSync: (channel, arg) => ipcRenderer.sendSync(channel, arg),
      on: (event, data) => ipcRenderer.on(event, data),
      invoke: (channel, arg) => ipcRenderer.invoke(channel, arg),
      removeListener: (event, listener) => ipcRenderer.removeAllListeners(event, listener),
    }
)