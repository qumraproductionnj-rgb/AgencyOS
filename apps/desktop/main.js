'use strict'

const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, Notification, shell } = require('electron')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const path = require('path')

const isDev = process.env['NODE_ENV'] === 'development' || !app.isPackaged

const APP_URL = isDev ? 'http://localhost:3000' : 'https://app.agencyos.app'

log.transports.file.level = 'info'
autoUpdater.logger = log

let win = null
let tray = null

function createWindow() {
  const isMac = process.platform === 'darwin'

  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    frame: isMac,
    backgroundColor: '#0a0a0a',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  // Show splash then load app
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    webPreferences: { sandbox: true },
  })
  splash.loadFile(path.join(__dirname, 'splash.html'))

  win.loadURL(APP_URL)

  win.once('ready-to-show', () => {
    setTimeout(() => {
      splash.destroy()
      win.show()
    }, 1800)
  })

  // App menu
  const isMacMenu = process.platform === 'darwin'
  const template = [
    ...(isMacMenu ? [{ role: 'appMenu' }] : []),
    {
      label: 'ملف',
      submenu: [
        {
          label: 'لوحة التحكم',
          accelerator: 'CmdOrCtrl+D',
          click: () => win.loadURL(APP_URL + '/ar/dashboard'),
        },
        {
          label: 'مشروع جديد',
          accelerator: 'CmdOrCtrl+N',
          click: () => win.loadURL(APP_URL + '/ar/projects'),
        },
        {
          label: 'فاتورة جديدة',
          accelerator: 'CmdOrCtrl+I',
          click: () => win.loadURL(APP_URL + '/ar/invoices'),
        },
        { type: 'separator' },
        { role: 'quit', label: 'خروج' },
      ],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  // IPC: window controls
  ipcMain.on('window:minimize', () => win && win.minimize())
  ipcMain.on('window:maximize', () => {
    if (!win) return
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })
  ipcMain.on('window:close', () => win && win.close())

  // IPC: native notifications
  ipcMain.on('notify', (_event, { title, body }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })

  win.on('closed', () => {
    win = null
  })
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon)

  const contextMenu = Menu.buildFromTemplate([
    { label: 'فتح Vision OS', click: () => win && win.show() },
    {
      label: 'لوحة التحكم',
      click: () => win && win.loadURL(APP_URL + '/ar/dashboard'),
    },
    { type: 'separator' },
    { label: 'إغلاق', role: 'quit' },
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('Vision OS')
  tray.on('double-click', () => win && win.show())
}

// Deep links
app.setAsDefaultProtocolClient('vision')

app.whenReady().then(() => {
  createWindow()
  createTray()

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Auto updater events
autoUpdater.on('update-downloaded', () => {
  if (Notification.isSupported()) {
    new Notification({
      title: 'Vision OS',
      body: 'تحديث جديد جاهز للتثبيت — سيتم التثبيت عند إعادة التشغيل',
    }).show()
  }
})

autoUpdater.on('error', (err) => {
  log.error('Auto updater error:', err)
})
