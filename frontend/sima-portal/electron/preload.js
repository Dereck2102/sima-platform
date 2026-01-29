// Minimal preload to keep contextIsolation true. Extend if renderer needs IPC-safe APIs.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('sima', {
  ping: () => 'pong',
});
