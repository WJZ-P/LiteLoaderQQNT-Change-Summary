import {pluginLog} from "./frontendLogUtils.js";

const csAPI = window.change_summary

export class SettingListeners {
    constructor(doc) {//传入一个document对象
        this.document = doc
    }

    async keyInputListener() {
        let picValue = undefined
        let memeValue = undefined

        const picInputEl = this.document.querySelector('#cs-input-pic')
        const memeInputEl = this.document.querySelector('#cs-input-meme')
        picInputEl.value = (await csAPI.getConfig()).picOutsideText
        memeInputEl.value = (await csAPI.getConfig()).memeOutsideText

        //设置监听器
        picInputEl.addEventListener('change', async event => {
            picValue = event.target.value

            // 发送设置密钥事件
            await csAPI.setConfig({picOutsideText: picValue})
            pluginLog('修改图片外显为' + picValue)
        })

        memeInputEl.addEventListener('change', async event => {
            memeValue = event.target.value

            // 发送设置密钥事件
            await csAPI.setConfig({memeOutsideText: memeValue})
            pluginLog('修改表情包外显为' + memeValue)
        })

    }

    onLoad() {
        this.keyInputListener()
    }
}
