const { app, Menu, BrowserWindow } = require('electron');

let mainWindow = null;
const menuTemplate = [
  {
    label: 'Меню',
    submenu: [
      {
        label: 'Редактор ШТЗ',
        click: () => {
          mainWindow.loadURL('file://' + __dirname + '/editorTTT.html');
          //mainWindow.webContents.openDevTools();
          mainWindow.on('closed', function() {
            mainWindow = null;
          });
        }
      },
      {
        label: 'Редактор ШТ',
        click: () => {
          mainWindow.loadURL('file://' + __dirname + '/editorTemplateTest.html');
          //mainWindow.webContents.openDevTools();
          mainWindow.on('closed', function() {
            mainWindow = null;
          });
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
