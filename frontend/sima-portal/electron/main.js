const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const createWindow = () => {
  const outDir = path.resolve(__dirname, '../out');
  const indexPath = path.join(outDir, 'index.html');
  const fallbackUrl = process.env.ELECTRON_FALLBACK_URL || 'http://localhost:3000';
  const iconPath = path.resolve(__dirname, '../public/uce-logo.png');

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
  });

  if (fs.existsSync(indexPath)) {
    win.loadFile(indexPath);
  } else {
    win.loadURL(fallbackUrl);
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
