// Electron 主进程 与 渲染进程 交互的桥梁
const {contextBridge,ipcRenderer} = require("electron");

// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("change_summary", {
    getMenuHTML: () => ipcRenderer.invoke("LiteLoader.change_summary.getMenuHTML"),
        getConfig: () => ipcRenderer.invoke("LiteLoader.change_summary.getConfig"),
    setConfig: (newConfig) => ipcRenderer.invoke("LiteLoader.change_summary.setConfig", newConfig),
});
