import {pluginLog} from "./frontendLogUtils.js";

const csAPI = window.change_summary

export class SettingListeners {
    constructor(doc) {//传入一个document对象
        this.document = doc
    }

    async initListener() {
        let picValue, memeValue, isPicOTuseRandom, isMemeOTuseRandom, rmApiValue, rmApiKeyValue;
        isPicOTuseRandom = (await csAPI.getConfig()).isPicOTuseRandom;
        isMemeOTuseRandom = (await csAPI.getConfig()).isMemeOTuseRandom;

        const picInputEl = this.document.querySelector('#cs-input-pic')
        const memeInputEl = this.document.querySelector('#cs-input-meme')
        picInputEl.value = (await csAPI.getConfig()).picOutsideText
        memeInputEl.value = (await csAPI.getConfig()).memeOutsideText

        // 随机外显开关部分
        const picRandomSw = this.document.querySelector('#cs-switch-pic');
        const memeRandomSw = this.document.querySelector('#cs-switch-meme');
        picRandomSw.classList.toggle('is-active', (await csAPI.getConfig()).isPicOTuseRandom);
        memeRandomSw.classList.toggle('is-active', (await csAPI.getConfig()).isMemeOTuseRandom);

        // 自定义随机文本API部分
        const rmApiInputEle = this.document.querySelector('#cs-input-rmapi');
        const rmApiKeyInputEle = this.document.querySelector('#cs-input-rmapi-key');
        rmApiInputEle.value = (await csAPI.getConfig()).randomTextApi;
        rmApiKeyInputEle.value = (await csAPI.getConfig()).randomTextApiKey;

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

        picRandomSw.addEventListener('click', async function(event) {
            isPicOTuseRandom = !isPicOTuseRandom;
            this.classList.toggle('is-active', isPicOTuseRandom);

            // 如果使用随机外显，则禁用自定义外显输入框并启用随机外显API输入框
            if(isPicOTuseRandom) {
                picInputEl.disabled = true;
                rmApiInputEle.disabled = false;
                rmApiKeyInputEle.disabled = false;
            } else if(isMemeOTuseRandom) {
                picInputEl.disabled = false; // 如果表情包还在用随机外显，则不禁用自定义外显API输入框
            } else {
                picInputEl.disabled = false;
                rmApiInputEle.disabled = true;
                rmApiKeyInputEle.disabled = true;
            }

            // 发送设置密钥事件
            await csAPI.setConfig({isPicOTuseRandom: isPicOTuseRandom})
            pluginLog(`修改图片外显随机开关为 ${isPicOTuseRandom}`)
        })

        memeRandomSw.addEventListener('click', async function(event) {
            isMemeOTuseRandom = !isMemeOTuseRandom;
            this.classList.toggle('is-active', isMemeOTuseRandom);

            // 如果使用随机外显，则禁用自定义外显输入框并启用随机外显API输入框
            if(isMemeOTuseRandom) {
                memeInputEl.disabled = true;
                rmApiInputEle.disabled = false;
                rmApiKeyInputEle.disabled = false;
            } else if(isPicOTuseRandom) {
                memeInputEl.disabled = false; // 如果图片还在用随机外显，则不禁用自定义外显API输入框
            } else {
                memeInputEl.disabled = false;
                rmApiInputEle.disabled = true;
                rmApiKeyInputEle.disabled = true;
            }

            // 发送设置密钥事件
            await csAPI.setConfig({isMemeOTuseRandom: isMemeOTuseRandom})
            pluginLog(`修改表情包外显随机开关为 ${isMemeOTuseRandom}`)
        })

        rmApiInputEle.addEventListener('change', async event => {
            rmApiValue = event.target.value

            // 发送设置密钥事件
            await csAPI.setConfig({randomTextApi: rmApiValue})
            pluginLog(`修改随机文本API为 ${rmApiValue}`)
        })

        rmApiKeyInputEle.addEventListener('change', async event => {
            rmApiKeyValue = event.target.value

            // 发送设置密钥事件
            await csAPI.setConfig({randomTextApiKey: rmApiKeyValue})
            pluginLog(`修改随机文本API获取键值为 ${rmApiKeyValue}`)
        })

    }

    onLoad() {
        this.initListener()
    }
}
