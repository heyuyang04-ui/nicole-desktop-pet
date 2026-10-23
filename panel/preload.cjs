'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nicole', {
  command: (command, value) => ipcRenderer.invoke('care:command', command, value),
  onStatus: callback => ipcRenderer.on('care:status', (_event, result) => callback(result)),
  onError: callback => ipcRenderer.on('care:error', (_event, error) => callback(error))
});
