const { app, BrowserWindow } = require('electron')
const { fork } = require("child_process")
const path = require("path")

const isAsar = process.mainModule.filename.includes('app.asar')

process.env.PORT = process.env.PORT || "24000"

const serverProcess = fork(path.resolve(__dirname, "server/server.js"))

try {
  serverProcess.stdout.on("data", console.log)
  serverProcess.stderr.on("data", console.error)
} catch(e) {}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;

function createWindow () {
  // Create the browser window.
  serverProcess.send("isServerRunning")
  serverProcess.once("message", (data) => {
    if (data === "isServerRunning") {
      win = new BrowserWindow({ width: 1024, height: 768, webPreferences: {
        nodeIntegration: true
      } })
    
      win.maximize()
    
      win.loadFile("public/index.html")

      if (!isAsar) {
        win.webContents.openDevTools()
      }
    
      win.on('closed', () => {
        win = null
      })
    }
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
    app.quit()
  // }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  createWindow()
})

// Ungraceful exit handler
function exitHandler() {
  console.log("Killing the server process");
  serverProcess.kill();
}

//do something when app is closing
process.on('exit', exitHandler);

//catches ctrl+c event
process.on('SIGINT', exitHandler);

//catches uncaught exceptions
process.on('uncaughtException', exitHandler);

process.on('message', data => {
  if (process.platform === "win32" && data === 'graceful-exit') {
    exitHandler();
  }
})
