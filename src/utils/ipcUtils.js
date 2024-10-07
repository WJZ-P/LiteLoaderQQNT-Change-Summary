 const {Config} = require("../Config.js")
const {pluginLog} = require("./backendLogUtils.js");

const config = Config.config


/**
 * 修改消息ipc
 * @param ipcProxy
 * @param window    window对象，主要用于在上传文件时提供进度条回馈。
 * @returns {function}
 */
function ipcModifyer(ipcProxy, window) {
    return new Proxy(ipcProxy, {
        async apply(target, thisArg, args) {
            let modifiedArgs = args;
            try { // thisArg是WebContent对象
                // 设置ipc通道名
                const ipcName = args?.[3]?.[1]?.[0];
                const eventName = args?.[3]?.[0]?.eventName;

                if (ipcName === 'nodeIKernelMsgService/sendMsg')
                    modifiedArgs = await ipcMsgModify(args, window);

                return await target.apply(thisArg, modifiedArgs);
            } catch (err) {
                console.log(err);
                return await target.apply(thisArg, args);
            }
        }
    });
}


async function ipcMsgModify(args) {
    // 获取随机文本辅助函数
    const getRandomText = async() => {
        const response = await fetch(config.randomTextApi);
        return await response.json();
    }

    if (!args?.[3]?.[1]?.[0] || args[3][1][0] !== 'nodeIKernelMsgService/sendMsg') return args;

    //修改原始消息
    for (let item of args[3][1][1].msgElements) {
        //说明消息内容是文字类
        if (item.elementType === 1) {
            //修改解密消息
            //item.textElement.summary='嘻嘻哈哈'   //这个修改没有用
        }

        //说明消息内容是图片类，则修改图片外显
        else if (item.elementType === 2) {
            pluginLog('尝试修改图片外显')

            try {
                const subtype = item.picElement.picSubType;
                const useRandom = subtype === 1 ? config.isMemeOTuseRandom : config.isPicOTuseRandom;
                const outsideText = subtype === 1 ? config.memeOutsideText : config.picOutsideText;

                if(useRandom)
                    item.picElement.summary = (await getRandomText())[config.randomTextApiKey];
                else item.picElement.summary = outsideText;
            } catch(e) {
                console.error(`获取随机文本或设置外显文字时发生错误: ${e}`);
            }


            // pluginLog('修改后的,msgElements为')
            // for (let item of args[3][1][1].msgElements) {
            //     console.log(item)
            // }
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