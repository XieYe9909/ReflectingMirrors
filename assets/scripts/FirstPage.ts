
import { _decorator, Component, sys, director } from 'cc';
import { TotalLevel } from './LevelData';
const { ccclass } = _decorator;

export let CurrentLevel = [0, 0];  // [Normal Level, My Level]

@ccclass('FirstPage')
export class FirstPage extends Component {
    onLoad() {
        let str = sys.localStorage.getItem('LevelState');
        if(str == null || str.length == 0) {
            let LevelState = new Array<boolean>(TotalLevel);
            for(let i=0; i<TotalLevel; i++) {
                LevelState[i] = false;
            }
            sys.localStorage.setItem('LevelState', JSON.stringify(LevelState));
        }
        else{
            let LevelState:boolean[] = JSON.parse(str);
            if(LevelState.length < TotalLevel) {
                let nLevelState = new Array<boolean>(TotalLevel);
                for(let i=0; i<TotalLevel; i++) {
                    if(i < LevelState.length) nLevelState[i] = LevelState[i];
                    else nLevelState[i] = false;
                }
                sys.localStorage.setItem('LevelState', JSON.stringify(nLevelState));
            }
        }
    }

    ClearData() {
        sys.localStorage.removeItem('CustomedLevelData');
        sys.localStorage.removeItem('LevelState');
        let LevelState = new Array<boolean>(TotalLevel);
        for(let i=0; i<TotalLevel; i++) {
            LevelState[i] = false;
            let scene_name = 'Level'+(i + 1);
            sys.localStorage.removeItem(scene_name);
        }
        sys.localStorage.setItem('LevelState', JSON.stringify(LevelState));
    }

    // async ImportLevel() {
    //     if (typeof wx == 'undefined') {
    //         return null;  // 如果不是微信环境，直接返回 null
    //     }
    //     try {
    //         const userInput = await this.ShowWechatInput();
    //         ImportedStr = userInput || '';
    //         if (userInput !== null) {
    //             director.loadScene('Level');
    //             wx.showToast({
    //                 title: '提交成功',
    //                 icon: 'success'
    //             });
    //         } else {
    //             console.log('用户取消了输入');
    //         }
    //     } catch (error) {
    //         console.error('输入过程出错:', error);
    //         wx.showToast({
    //             title: '输入失败',
    //             icon: 'error'
    //         });
    //     }
    // }
    
    // async ShowWechatInput(): Promise<string | null> {
    //     let title = '请输入关卡代码';
    //     let content = '';
    //     let placeholder = '请输入...';
    //     let confirmText = '确定';
    //     let cancelText = '取消';

    //     return new Promise((resolve) => {
    //         wx.showModal({
    //         title,
    //         editable: true,
    //         content,
    //         placeholderText: placeholder,
    //         confirmText,
    //         cancelText,
    //         success: (res: { confirm: any; content: any; }) => {
    //             if (res.confirm) {
    //             // 用户点击确定，返回输入的内容
    //             resolve(res.content || '');
    //             } else {
    //             // 用户取消输入
    //             resolve(null);
    //             }
    //         },
    //         fail: () => {
    //             // 调用失败时也返回null
    //             resolve(null);
    //         }
    //         });
    //     });
    // }
}
