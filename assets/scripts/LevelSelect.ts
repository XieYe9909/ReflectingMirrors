
import { _decorator, Component, director, sys, Sprite, Color, Label } from 'cc';
import { CurrentLevel } from './FirstPage';
const { ccclass } = _decorator;

@ccclass('LevelSelect')
export class LevelSelect extends Component {
    index: number;

    onLoad() {
        this.index = this.GetLevelIndex();
        
        let label = this.node.getChildByName('Label').getComponent(Label);
        label.string = String(this.index + 1);

        let LevelState: boolean[] = JSON.parse(sys.localStorage.getItem('LevelState'));
        let sprite = this.node.getComponent(Sprite);

        if(LevelState[this.index]) {
            sprite.color = new Color(100, 200, 0, 255);
        }
        else {
            sprite.color = new Color(255, 255, 255, 255);
        }
    }

    GetLevelIndex(): number {
        let name = this.node.name;
        let level_index = name.slice(5, name.length);
        let index = Number(level_index);
        return(index - 1);
    }

    Select() {
        CurrentLevel[0] = this.index + 1;
        director.loadScene('Level');
    }
}
