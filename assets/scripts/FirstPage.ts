
import { _decorator, Component, sys } from 'cc';
import { TotalLevel } from './LevelData';
const { ccclass } = _decorator;

export let CurrentLevel = [0];

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
