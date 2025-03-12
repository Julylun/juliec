window.electron = require('electron');


contextBridge.exposeInMainWorld("electron", {
    // Thêm các API bạn muốn expose ở đây
  });