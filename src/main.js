const {pluginLog} = require("./utils/backendLogUtils.js");
const {ipcModifyer} = require("./utils/ipcUtils.js");
const path = require("path");
const {Config} = require("./Config.js");
// 运行在 Electron 主进程 下的插件入口
// 创建窗口时触发

const pluginPath = path.join(LiteLoader.plugins.change_summary.path.plugin);//插件目录
const configPath = path.join(pluginPath, "config.json");

const config = Config.config

module.exports.onBrowserWindowCreated = window => {
    // window 为 Electron 的 BrowserWindow 实例
    window.webContents.on("did-stop-loading", async () => {
        if (window.webContents.getURL().indexOf("#/main/message") === -1 ||
            window.webContents.getURL().indexOf("#/chat") === -1
        ) return;

        try {
            //window 为 Electron 的 BrowserWindow 实例
            pluginLog('启动！')
            await onload()
            pluginLog("main.js onLoad注入成功")

            //替换掉官方的ipc监听器
            window.webContents._events["-ipc-message"] = ipcModifyer(window.webContents._events["-ipc-message"])
            pluginLog('ipc监听器修改成功')

        } catch (e) {
            console.log(e)
        }
    })
}

async function onload() {
}