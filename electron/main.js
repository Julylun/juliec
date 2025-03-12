const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      nodeIntegration: true,
    },
  });


  win.loadURL("../dist/index.html"); // Đổi thành file tĩnh khi build
//   win.webContents.openDevTools(); // Mở DevTools để xem log
}



// app.commandLine.appendSwitch("--disable-gpu");
// app.commandLine.appendSwitch("--disable-software-rasterizer");
// app.commandLine.appendSwitch("enable-logging");

// app.disableHardwareAcceleration(); 
app.commandLine.appendSwitch("enable-features", "WaylandWindowDecorations");
app.commandLine.appendSwitch("ozone-platform-hint", "auto"); // hoặc "wayland"

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
