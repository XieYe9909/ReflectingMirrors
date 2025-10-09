
import { _decorator, Component, director, Button, sys, Sprite, Color, Label } from 'cc';
import { TotalBasicLevel, TotalExtraLevel, ExtraLevelStart } from './LevelData';
import { CurrentLevel } from './FirstPage';
import { LevelSelect } from './LevelSelect';
const { ccclass } = _decorator;

@ccclass('LevelSelectButton')
export class LevelSelectButton extends Component {
    index: number;

    onLoad() {
        this.Update();
    }

    Update() {
        let page = this.node.parent.getComponent(LevelSelect).page;
        this.index = this.GetLevelIndex() + page * 10;
        
        let label = this.node.getChildByName('Label').getComponent(Label);
        let DisplayedIndex = (this.index >= ExtraLevelStart) ? (this.index - ExtraLevelStart + 1) : (this.index + 1);
        label.string = (this.index >= ExtraLevelStart) ? 'Ex' + String(DisplayedIndex) : String(DisplayedIndex);

        if ((this.index >= TotalBasicLevel && this.index < ExtraLevelStart) || (this.index >= ExtraLevelStart + TotalExtraLevel)) {
            this.getComponent(Button).interactable = false;
            return;
        } else {
            this.getComponent(Button).interactable = true;
        }

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
        return index;
    }

    Select() {
        CurrentLevel[0] = this.index + 1;
        director.loadScene('Level');
    }
}
