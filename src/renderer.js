// 运行在 Electron 渲染进程 下的页面脚本

// 打开设置界面时触发
import {SettingListeners} from "./utils/SettingListeners.js";

export const onSettingWindowCreated = async view => {
    // view 为 Element 对象，修改将同步到插件设置界面
    // 这个函数导出之后在QQ设置里面可以直接看见插件页面

    try {
        //整个插件主菜单
        const parser = new DOMParser()
        const settingHTML = parser
            .parseFromString(await window.change_summary.getMenuHTML(), "text/html")
            .querySelector("change-summary-plugin-menu")

        const myListener = new SettingListeners(settingHTML)
        myListener.onLoad()
        view.appendChild(settingHTML);

        // myListener.onLoad()//调用监听器
    } catch (e) {
        setInterval(() => {//防止调试未打开就已经输出，导致捕获不到错误
            console.log(e)
        }, 1000)
    }
}
