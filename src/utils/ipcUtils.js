const {Config} = require("../Config.js")
const {pluginLog} = require("./backendLogUtils.js");

const config = Config.config


/**
 * 修改消息ipc
 * @param ipcProxy
 * @param window    window对象，主要用于在上传文件时提供进度条回馈。诶诶这个是EC的不是CS的！
 * @returns {function}
 */
function ipcModifyer(ipcProxy, window) {
    return new Proxy(ipcProxy, {
        async apply(target, thisArg, args) {
            let modifiedArgs = args;
            try { // thisArg是WebContent对象
                // 设置ipc通道名
                let ipcName = args?.[3]?.[1]?.[0] || args?.[3]?.[1]?.cmdName;
                const eventName = args?.[3]?.[0]?.eventName;
                if(!ipcName) ipcName = args?.[3]?.[1]?.cmdName//兼容高版本。

                if (ipcName === 'nodeIKernelMsgService/sendMsg')
                    modifiedArgs = await ipcMsgModify(args,ipcName, window);

                return await target.apply(thisArg, modifiedArgs);
            } catch (err) {
                console.log(err);
                return await target.apply(thisArg, args);
            }
        }
    });
}


async function ipcMsgModify(args,ipcName) {
    // 获取随机文本辅助函数
    const getRandomText = async () => {
        const response = await fetch(config.randomTextApi);
        const json = await response.json();
        if(!response.ok || !json.hasOwnProperty(config.randomTextApiKey))
            return false;
        return json[config.randomTextApiKey];
    }

    if (ipcName !== 'nodeIKernelMsgService/sendMsg') return args;

    let payload = Array.isArray(args[3][1]) ? args[3][1] : args[3][1].payload;

    if(!payload) payload=args[3][1].payload[0]//[1]是null.

    //修改原始消息
    for (let item of payload.msgElements) {
        //说明消息内容是文字类
        if (item.elementType === 1) {
            //修改解密消息
            //item.textElement.summary='嘻嘻哈哈'   //这个修改没有用
        }

        //说明消息内容是图片类，则修改图片外显
        else if (item.elementType === 2) {
            pluginLog('尝试修改图片外显')
            try {
                const subtype = item.picElement.picSubType;//subType 1是表情包，0是图片
                const useRandom = subtype === 1 ? config.isMemeOTuseRandom : config.isPicOTuseRandom;
                const outsideText = subtype === 1 ? config.memeOutsideText : config.picOutsideText;

                let summary = outsideText;
                if (useRandom)
                    summary = (await getRandomText()) || outsideText;
                item.picElement.summary = summary;
            } catch (e) {
                console.error(`获取随机文本或设置外显文字时发生错误: ${e}`);
            }


            // pluginLog('修改后的,msgElements为')
            // for (let item of args[3][1][1].msgElements) {
            //     console.log(item)
            // }
        } else if (item.elementType === 11) {//11是marketFaceElement，是商城表情，用表情包的外显或者随机外显吧
            try {
                pluginLog('尝试修改商城表情外显')

                const useRandom = config.isMemeOTuseRandom
                const outsideText = config.memeOutsideText

                let summary = outsideText;
                if (useRandom)
                    summary = (await getRandomText()) || outsideText;
                item.marketFaceElement.faceName = summary;

            } catch (e) {
                pluginLog(`获取随机文本或设置外显文字时发生错误: ${e}`);
            }
        }
    }

    return args
}


const textElement = {
    elementType: 1,
    elementId: '',
    textElement: {content: '测试', atType: 0, atUid: '', atTinyId: '', atNtUid: ''}
}


module.exports = {ipcModifyer}
//插入一个卡片消息
// args[3][1][1].msgElements.push({
//     elementType: 10,
//     elementId: '',
//     arkElement: {
//         bytesData: JSON.stringify({
//             "app": "com.tencent.tdoc.qqpush",
//             "desc": "",
//             "bizsrc": "",
//             "view": "pic",
//             "ver": "1.0.0.15",
//             "prompt": "[QQ红包]恭喜发财",
//             "meta": {
//                 "pic": {
//                     "jumpUrl": "",
//                     "preview": "http:\/\/p.qlogo.cn\/homework\/0\/hw_h_4xknus6xi70gkck66c88b25f1298\/0\/25632286"
//                 }
//             },
//             "config": {"ctime": 1714214660, "forward": 1, "token": "f1245530d59bccad2b1c695544e98efb"}
//         }),
//         linkInfo: null,
//         subElementType: null
//     }
// })