const { app, Menu, BrowserWindow } = require('electron');

let mainWindow = null;
const menuTemplate = [
  {
    label: 'Файл',
    submenu: [
      {
        label: 'Создать ШТЗ',
        click: () => {
          mainWindow.loadURL('file://' + __dirname + '/index.html');
          mainWindow.webContents.openDevTools();
          mainWindow.on('closed', function() {
            mainWindow = null;
          });
        }
      },
      {
        label: 'Создать ШТ',
        click: () => {
        }
      },
      {
        label: 'Выход',
        accelerator: 'Alt+F4',
        click: () => {
          app.quit();
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'Диплом'
  });
});
