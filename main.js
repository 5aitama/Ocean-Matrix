const { app, BrowserWindow } = require('electron')

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        titleBarStyle: 'hiddenInset',
        resizable: false,
        fullscreenable: false,
        minimizable: false,
        maximizable: false,
        frame: false,
        backgroundColor: '#F1C40F'
    })

    mainWindow.loadFile('main.html')

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if(process.platform === null) {
        createWindow()
    }
})