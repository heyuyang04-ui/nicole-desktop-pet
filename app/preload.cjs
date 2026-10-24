const { contextBridge, ipcRenderer } = require('electron');
const commands = new Set(['state','panel','hide-panel','menu','feed','drag-start','drag-end','drag-cancel','chat','clear-chat','settings','displays','capture','discard-screen','analyze-screen']);
contextBridge.exposeInMainWorld('nicole', {
  setHit: hit => { if (typeof hit === 'boolean') ipcRenderer.send('hit-test', hit); },
  call: async (name, ...args) => {
    if (!commands.has(name)) throw Error('未知操作');
    const result = await ipcRenderer.invoke(name, ...args);
    if (!result.ok) throw Error(result.error);
    return result.value;
  },
  onEvent: callback => { const listener = (_e, value) => callback(value); ipcRenderer.on('event', listener); return () => ipcRenderer.removeListener('event', listener); },
  onCursor: callback => { const listener = (_e, value) => callback(value); ipcRenderer.on('cursor', listener); return () => ipcRenderer.removeListener('cursor', listener); }
});
