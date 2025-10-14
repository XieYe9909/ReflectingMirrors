
import { _decorator, Component, director, Button, sys, Sprite, Color, Label } from 'cc';
import { TotalBasicLevel, TotalExtraLevel, ExtraLevelStart, BasicLevelPerPage, ExtraLevelPerPage } from './LevelData';
import { CurrentLevel } from './FirstPage';
import { LevelSelect } from './LevelSelect';
const { ccclass } = _decorator;

@ccclass('LevelSelectButton')
export class LevelSelectButton extends Component {
    index: number;

    onLoad() {
        let page = this.node.parent.getComponent(LevelSelect).page;
        let button_index = this.getButtonIndex();
        this.index = button_index + page * (button_index < ExtraLevelStart ? BasicLevelPerPage : ExtraLevelPerPage);
        
        let label = this.node.getChildByName('Label').getComponent(Label);
        let DisplayedIndex = (this.index >= ExtraLevelStart) ? (this.index - ExtraLevelStart + 1) : (this.index + 1);
        label.string = (this.index >= ExtraLevelStart) ? 'Ex' + String(DisplayedIndex) : String(DisplayedIndex);

        this.node.active = ((this.index >= 0 && this.index < TotalBasicLevel) || (this.index >= ExtraLevelStart && this.index < ExtraLevelStart + TotalExtraLevel));
        
        let LevelState: boolean[] = JSON.parse(sys.localStorage.getItem('LevelState'));
        let sprite = this.node.getComponent(Sprite);

        if(LevelState[this.index]) {
            sprite.color = new Color(100, 200, 0, 255);
        }
        else {
            sprite.color = new Color(255, 255, 255, 255);
        }
    }

    getButtonIndex(): number {
        let name = this.node.name;
        return Number(name.slice(5, name.length));
    }

    select() {
        CurrentLevel[0] = this.index;
        director.loadScene('Level');
    }
}
