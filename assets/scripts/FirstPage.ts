
import { _decorator, Component, sys, director } from 'cc';
import { TotalLevel } from './LevelData';
import { showUserConfirm } from './Utils';
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

    async ClearData() {
        let confirm = await showUserConfirm('确认清除所有进度？此操作不可逆。');
        if (!confirm) {
            return;
        }
        
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
}
