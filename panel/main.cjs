'use strict';
const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, Notification, clipboard, screen, dialog, powerMonitor } = require('electron');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { CarePanel, fitPosition } = require('./controller.cjs');

const root = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
if (!path.isAbsolute(root)) throw new Error('CODEX_HOME must be absolute');
// Keep test and custom CODEX_HOME instances isolated from the regular panel.
app.setPath('userData', path.join(root, 'pet-state/nicole/panel-runtime'));
app.setName('Nicole Care');
app.setAppUserModelId('io.github.heyuyang04-ui.nicole-care');
let win, tray, controller, timer, moveTimer, lastStatus, lastFeed = 0;
const page = path.join(__dirname, 'index.html');
const pageURL = pathToFileURL(page).href;
const dimensions = compact => compact ? [272, 64] : [352, 376];

function refresh(action = 'status') {
  try {
    const result = controller.update(action);
    lastStatus = result;
    win?.webContents.send('care:status', result);
    if (result.announce && result.preferences.notifications && Notification.isSupported()) {
      const notice = new Notification({ title: '妮可有点饿了', body: `饱腹度 ${result.fullness}%，给我一点好吃的吧～`, silent: true });
      notice.on('click', () => win?.show()); notice.show();
    }
    return { ok: true, ...result };
  } catch (error) {
    const result = { ok: false, error: error.message };
    win?.webContents.send('care:error', result.error);
    return result;
  }
}
function resize() {
  const [width, height] = dimensions(controller.preferences.compact);
  const current = win.getBounds();
  const workArea = screen.getDisplayMatching(current).workArea;
  win.setBounds({ ...fitPosition(current, workArea, width, height), width, height });
  win.setAlwaysOnTop(controller.preferences.pinned, 'floating');
}
function toggle(key) {
  controller.setPreference(key, !controller.preferences[key]); resize(); refresh();
}
function feed() {
  if (Date.now() - lastFeed < 1200) return { ok: false, error: '等妮可咽下这一口，再喂她吧。' };
  const result = refresh('feed');
  if (result.ok) lastFeed = Date.now();
  return result;
}
function menu() {
  return Menu.buildFromTemplate([
    { label: `饱腹度 ${lastStatus ? lastStatus.fullness + '%' : '读取中'}`, enabled: false },
    { label: '喂妮可 +30%', click: feed },
    { type: 'separator' },
    { label: '精简胶囊', type: 'checkbox', checked: controller.preferences.compact, click: () => toggle('compact') },
    { label: '保持置顶', type: 'checkbox', checked: controller.preferences.pinned, click: () => toggle('pinned') },
    { label: '饥饿系统通知', type: 'checkbox', checked: controller.preferences.notifications, click: () => toggle('notifications') },
    { label: '显示面板', click: () => win.show() },
    { label: '退出照料面板', click: () => app.quit() }
  ]);
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => win?.show());
  app.whenReady().then(() => {
    controller = new CarePanel(root);
    const [width, height] = dimensions(controller.preferences.compact);
    const position = controller.preferences.position;
    const display = Number.isInteger(position?.x) && Number.isInteger(position?.y)
      ? screen.getDisplayNearestPoint(position) : screen.getPrimaryDisplay();
    win = new BrowserWindow({ width, height, ...fitPosition(position, display.workArea, width, height),
      frame: false, transparent: true, resizable: false, maximizable: false, fullscreenable: false,
      show: false, hasShadow: false, alwaysOnTop: controller.preferences.pinned,
      title: '妮可照料面板', backgroundColor: '#00000000',
      webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true }
    });
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    win.webContents.on('will-navigate', event => event.preventDefault());
    win.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    win.webContents.on('context-menu', () => menu().popup({ window: win }));
    win.once('ready-to-show', () => { win.show(); refresh(); });
    win.on('move', () => {
      clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        if (win && !win.isDestroyed()) { const bounds = win.getBounds(); controller.setPosition(bounds.x, bounds.y); }
      }, 600);
    });
    win.on('closed', () => { win = null; app.quit(); });
    const icon = nativeImage.createFromPath(path.join(__dirname, '../assets/pet/idle.png')).resize({ width: 18, height: 20 });
    tray = new Tray(icon); tray.setToolTip('妮可照料面板');
    tray.on('click', () => win?.show());
    tray.on('right-click', () => tray.popUpContextMenu(menu()));
    ipcMain.handle('care:command', (event, command, value) => {
      if (event.sender !== win?.webContents || event.senderFrame !== win.webContents.mainFrame || event.senderFrame.url !== pageURL) throw new Error('Invalid sender');
      try {
        if (command === 'status') return refresh();
        if (command === 'feed') return feed();
        if (command === 'compact' || command === 'pinned' || command === 'notifications') {
          controller.setPreference(command, value); resize(); return refresh();
        }
        if (command === 'chat') { clipboard.writeText('$nicole-pet 妮可陪我聊天'); return { ok: true }; }
        if (command === 'close') { app.quit(); return { ok: true }; }
        return { ok: false, error: 'Unknown command' };
      } catch (error) { return { ok: false, error: error.message }; }
    });
    win.loadFile(page);
    timer = setInterval(() => refresh(), 15000);
    powerMonitor.on('resume', () => refresh());
    screen.on('display-removed', () => resize());
  }).catch(error => { dialog.showErrorBox('妮可面板未启动', error.message); app.quit(); });
}
app.on('before-quit', () => { clearInterval(timer); clearTimeout(moveTimer); tray?.destroy(); });
app.on('activate', () => win?.show());
