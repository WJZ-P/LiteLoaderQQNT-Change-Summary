const {ipcMain} = require("electron");
const {pluginLog} = require("./utils/backendLogUtils.js");
const {ipcModifyer} = require("./utils/ipcUtils.js");
const path = require("path");
const {Config} = require("./Config.js");
const fs = require("fs");
// 运行在 Electron 主进程 下的插件入口
// 创建窗口时触发

const pluginPath = path.join(LiteLoader.plugins.change_summary.path.plugin);//插件目录
const configPath = path.join(pluginPath, "config.json");

const config = Config.config

module.exports.onBrowserWindowCreated = window => {
    // window 为 Electron 的 BrowserWindow 实例
    window.webContents.on("did-stop-loading", async () => {
        if (window.webContents.getURL().indexOf("#/main/message") === -1 &&
            window.webContents.getURL().indexOf("#/chat") === -1
        ) {
            // pluginLog('当前窗口ID为' + window.id)
            //pluginLog(window.webContents.getURL())
            // pluginLog(window.webContents.getURL().indexOf("#/main/message"))
            return;
        }

        pluginLog('聊天窗口校验通过！当前是聊天窗口')
        await Config.initConfig(pluginPath, configPath)//加载配置
        pluginLog('配置加载完成，当前配置为')
        console.log(config)

        try {
            //window 为 Electron 的 BrowserWindow 实例
            //pluginLog('启动！')
            await onload()
            //pluginLog("main.js onLoad注入成功")

            //替换掉官方的ipc监听器
            window.webContents._events["-ipc-message"] = ipcModifyer(window.webContents._events["-ipc-message"])
            pluginLog('ipc监听器修改成功')

        } catch (e) {
            console.log(e)
        }
    })
}

ipcMain.handle("LiteLoader.change_summary.getMenuHTML", () => fs.readFileSync(path.join(
    LiteLoader.plugins.change_summary.path.plugin, 'src/pluginMenu.html'), 'utf-8'))

ipcMain.handle("LiteLoader.change_summary.getConfig", () => Config.getConfig())
    ipcMain.handle("LiteLoader.change_summary.setConfig", (event, newConfig) => {
        pluginLog('主进程收到setConfig消息，更新设置。')
        //更新配置，并且返回新的配置
        return Config.setConfig(newConfig)
    })

async function onload() {
}