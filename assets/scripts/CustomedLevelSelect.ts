import { _decorator, Component, sys, Label, Button, director, Sprite, Color } from 'cc';
import { SaveLevel, DeleteLevel, LevelInfo } from './Storage';
import { CurrentLevel } from './FirstPage';
import { showWechatInputName, showWechatInputCode, showUserConfirm } from './utils';
const { ccclass, property } = _decorator;

// 声明 wx 变量以避免找不到名称错误
declare const wx: any;

@ccclass('CustomedLevelSelect')
export class CustomedLevelSelect extends Component {
    current_page: number;
    total_page: number;
    total_levels: number;
    levels_per_page: number = 5;
    level_info_array: LevelInfo[];

    onLoad() {
        this.current_page = (CurrentLevel[1] == 0) ? 1 : Math.ceil(CurrentLevel[1] / this.levels_per_page);
        let data = sys.localStorage.getItem('CustomedLevelData');
        let level_info_array = data ? JSON.parse(data) : [];

        if (level_info_array == null || level_info_array.length == 0) {
            this.total_levels = 0;
            this.total_page = 1;
            this.level_info_array = [];
        }
        else {
            this.total_levels = level_info_array.length;
            this.total_page = Math.ceil(this.total_levels / this.levels_per_page);
            this.level_info_array = level_info_array;
        }
    }

    start() {
        let next_page = this.node.getChildByName('NextPage');
        let previous_page = this.node.getChildByName('PrevPage');
        let page_index = this.node.getChildByName('PageIndex');

        let previous_page_button = previous_page.getComponent(Button);
        let next_page_button = next_page.getComponent(Button);
        let page_index_label = page_index.getComponent(Label);

        previous_page_button.interactable = (this.current_page > 1) ? true : false;
        next_page_button.interactable = (this.current_page < this.total_page) ? true : false;
        page_index_label.string = this.current_page + ' / ' + this.total_page;

        for (let i = 1; i <= this.levels_per_page; i++) {
            let level_node = this.node.getChildByName('Level' + i);
            if (this.current_page < this.total_page) {
                let level_index = (this.current_page - 1) * this.levels_per_page + i - 1;
                let level_name = this.level_info_array[level_index].name;

                level_node.active = true;
                let label = level_node.getChildByName('Label').getComponent(Label);
                label.string = level_name;
                
                let sprite = level_node.getComponent(Sprite);
                if (this.level_info_array[level_index].isPassed) {
                    sprite.color = new Color(100, 200, 0, 255);
                }
                else {
                    sprite.color = new Color(255, 255, 255, 255);
                }
            }
            else {  // last page
                if (i <= this.total_levels - (this.current_page - 1) * this.levels_per_page) {
                    let level_index = (this.current_page - 1) * this.levels_per_page + i - 1;
                    let level_name = this.level_info_array[level_index].name;

                    level_node.active = true;
                    let label = level_node.getChildByName('Label').getComponent(Label);
                    label.string = level_name;

                    let sprite = level_node.getComponent(Sprite);
                    if (this.level_info_array[level_index].isPassed) {
                        sprite.color = new Color(100, 200, 0, 255);
                    }
                    else {
                        sprite.color = new Color(255, 255, 255, 255);
                    }
                }
                else {  // hide unused level buttons
                    level_node.active = false;
                }
            }
        }
    }

    previousPage() {
        this.current_page -= 1;
        this.start();
    }

    nextPage() {
        this.current_page += 1;
        this.start();
    }

    selectLevel(event, customEventData) {
        let button_index = Number(event.target.name.slice(5, event.target.name.length));
        CurrentLevel[1] = (this.current_page - 1) * this.levels_per_page + button_index;
        director.loadScene('CustomedLevel');
    }

    async rename(event, customEventData) {
        let button_index = Number(event.target.parent.name.slice(5, event.target.name.length));
        let level_index = (this.current_page - 1) * this.levels_per_page + button_index - 1;

        if (typeof wx == 'undefined') {
            console.log('非微信环境');

            let new_name = '新关卡';
            this.level_info_array[level_index].name = new_name;
            sys.localStorage.setItem('CustomedLevelData', JSON.stringify(this.level_info_array));

            this.onLoad();
            this.start();

            return null;  // 如果不是微信环境，直接返回 null
        }

        try {
            const new_name = await showWechatInputName();
            if (new_name !== null) {
                this.level_info_array[level_index].name = (new_name.length == 0) ? '自定义关卡' : new_name;
                sys.localStorage.setItem('CustomedLevelData', JSON.stringify(this.level_info_array));

                this.onLoad();
                this.start();
                wx.showToast({
                    title: '重命名成功',
                    icon: 'success'
                });
            }
            else {
                console.log('用户取消了输入');
            }
        }
        catch (error) {
            console.error('输入过程出错:', error);
            wx.showToast({
                title: '输入失败',
                icon: 'error'
            });
        }
    }

    async deleteLevel(event, customEventData) {
        let confirm = await showUserConfirm('确定删除关卡？');
        if (!confirm) {
            return;
        }
        let button_index = Number(event.target.parent.name.slice(5, event.target.name.length));
        let level_index = (this.current_page - 1) * this.levels_per_page + button_index - 1;

        DeleteLevel(level_index);
        CurrentLevel[1] = level_index;
        this.onLoad();
        this.start();
    }

    async importLevel() {
        if (typeof wx == 'undefined') {
            console.log('非微信环境');

            let name = '测试关卡';
            let code = 'B0f0P7mQ11248192R7l0n0V6l-n8l-n';
            SaveLevel(name, code, 0, false);

            CurrentLevel[1] = this.total_levels + 1;
            this.onLoad();
            this.start();

            return null;  // 如果不是微信环境，直接返回 null
        }

        try {
            const code = await showWechatInputCode();
            if (code !== null) {
                let success = SaveLevel('自定义关卡', code, 0, false);

                if (success) {
                    CurrentLevel[1] = this.total_levels + 1;
                    this.onLoad();
                    this.start();
                    wx.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });
                }
                else {
                    wx.showToast({
                        title: '存档已满，无法保存',
                        icon: 'error'
                    });
                }
            }
            else {
                console.log('用户取消了输入');
            }
        }
        catch (error) {
            console.error('输入过程出错:', error);
            wx.showToast({
                title: '输入失败',
                icon: 'error'
            });
        }
    }

    back() {
        CurrentLevel[1] = 0;
        director.loadScene('FirstPage');
    }

    // async showWechatInputCode(): Promise<string | null> {
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

    update(deltaTime: number) {
        
    }
}

