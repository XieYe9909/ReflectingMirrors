import { _decorator, director, Label, Node, sys } from 'cc';
import { MainTheme } from './MainTheme';
import { ClearMatrix } from './Square';
import { CurrentLevel } from './FirstPage';
import { LevelInfo, DeleteLevel } from './Storage';
import { Mirror, MirrorState } from './Mirror';
import { generateLocate } from './utils';
import { matrix1, matrix2 } from './Square';
const { ccclass, property } = _decorator;

declare const wx: any;

@ccclass('MyLevel')
export class MyLevel extends MainTheme {
    level_info_array: LevelInfo[];
    level_info: LevelInfo;

    onLoad() {
        ClearMatrix();
        this.initLightPiece();

        this.level_index = CurrentLevel[1] - 1;
        let data = sys.localStorage.getItem('CustomedLevelData');
        let level_info_array = data ? JSON.parse(data) : [];

        if (level_info_array == null || level_info_array.length == 0) {
            this.level_flag = false;
            return;
        }
        
        this.level_info_array = level_info_array;
        this.level_info = this.level_info_array[this.level_index];

        this.level_name = this.level_info.name;
        this.level_code = this.level_info.code;
        this.level_difficulty = 0;
        this.describe_str = '';
        this.success_str = '';
        this.customized_level = true;
        this.tot_level_num = level_info_array.length;
        this.level_flag = this.setLevel();
    }

    setMirror(id_arr: number[], num_arr: number[]) {
        super.setMirror(id_arr, num_arr);

        if (this.level_info.MS_array.length == 0) {
            for (let i = 0; i < this.mirror_array.length; i++) {
                let mirror_state = new MirrorState(0, 2, generateLocate(i));
                this.level_info.MS_array.push(mirror_state);
            }
        }

        for(let i=0; i<this.mirror_array.length; i++) {
            this.mirror_array[i].getComponent(Mirror).SetMirror(this.level_info.MS_array[i]);
        }
    }

    setUserState(success: boolean): void {
        let label = this.node.getChildByName('UserState').getComponent(Label);

        if (success) {
            label.string = '过关！';
            if (!this.level_info.isPassed) {
                this.level_info.isPassed = true;
            }
        } else {
            label.string = this.level_info.isPassed ? '已过关' : '未过关';
        }
    }

    prevLevel() {
        CurrentLevel[1]--;
        this.level_index--;
        this.level_info = this.level_info_array[this.level_index];
        this.level_name = this.level_info.name;
        this.level_code = this.level_info.code;

        this.destroyLevel();
        this.level_flag = this.setLevel();
        this.start();
    }
    
    nextLevel() {
        CurrentLevel[1]++;
        this.level_index++;
        this.level_info = this.level_info_array[this.level_index];
        this.level_name = this.level_info.name;
        this.level_code = this.level_info.code;

        this.destroyLevel();
        this.level_flag = this.setLevel();
        this.start();
    }

    selectLevel(): void {
        sys.localStorage.setItem('CustomedLevelData', JSON.stringify(this.level_info_array));
        director.loadScene('CustomedLevelSelect');
    }

    reset() {
        if(!this.level_flag) return;

        let MS_array = this.level_info.MS_array;
        for(let i=0; i<MS_array.length; i++) {
            MS_array[i].dir = 0;
            MS_array[i].area = 2;

            let locate = generateLocate(i);
            MS_array[i].locate[0] = locate[0];
            MS_array[i].locate[1] = locate[1];

            let mirror = this.mirror_array[i].getComponent(Mirror);
            if (mirror.area == 1) {
                matrix1[mirror.squarex*15 + mirror.squarey].id = -1;
            }
            mirror.SetMirror(MS_array[i]);
        }

        for(let i=0; i<12*2; i++) {
            let [x, y] = generateLocate(i);
            matrix2[x*2 + y] = (i < MS_array.length) ? true : false;
        }

        this.changeMirror();
    }

    exportCode() {
        let code = this.level_code;

        if (typeof wx !== 'undefined') {
            console.log("Copying to clipboard...");
            wx.setClipboardData({
                data: code},
            ).then(() => {
                wx.showToast({
                  title: '已复制关卡代码到剪贴板',
                })
            }).catch(err => {
              console.error('复制失败', err)
            })
        }
        else {
            console.log(code);
        }
    }

    updateMirrorJson(node: Node): void {
        let index = this.mirror_array.findIndex(arrayNode => arrayNode.uuid === node.uuid);
        let mirror = this.mirror_array[index].getComponent(Mirror);

        let MS_array = this.level_info.MS_array;
        MS_array[index].dir = mirror.dir;
        MS_array[index].area = mirror.area;
        MS_array[index].locate[0] = mirror.squarex;
        MS_array[index].locate[1] = mirror.squarey;
    }

    update(deltaTime: number) {
        
    }
}
