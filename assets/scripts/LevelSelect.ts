import { _decorator, Component, Button, Label } from 'cc';
import { TotalBasicLevel, TotalExtraLevel, ExtraLevelStart } from './LevelData';
import { LevelSelectButton } from './LevelSelectButton';
import { CurrentLevel } from './FirstPage'
const { ccclass } = _decorator;

@ccclass('LevelSelect')
export class LevelSelect extends Component {
    page: number;
    max_page: number;

    onLoad() {
        this.page = Math.floor(((CurrentLevel[0] >= ExtraLevelStart) ? (CurrentLevel[0] - ExtraLevelStart) : CurrentLevel[0]) / 10);
        this.max_page = Math.ceil(((TotalBasicLevel > TotalExtraLevel) ? TotalBasicLevel : TotalExtraLevel) / 10);
        this.UpdatePage();
    }

    UpdatePage() {
        // let label = this.node.getChildByName('CurrentPage').getComponent(Label);
        // label.string = String(this.page + 1);

        let levels = this.node.children;
        for (var i=0; i<levels.length; i++) {
            let button = levels[i].getComponent('LevelSelectButton') as (LevelSelectButton | null);
            if (button == null) continue;
            button.Update();
        }

        let prevPage = this.node.getChildByName('PrevPage').getComponent(Button);
        let nextPage = this.node.getChildByName('NextPage').getComponent(Button);
        if (this.page <= 0) prevPage.interactable = false;
        else prevPage.interactable = true;
        if (this.page >= this.max_page - 1) nextPage.interactable = false;
        else nextPage.interactable = true;

        let pageIndex = this.node.getChildByName('PageIndex').getComponent(Label);
        pageIndex.string = (this.page + 1) + ' / ' + this.max_page;
    }

    PageUp() {
        this.page++;
        this.UpdatePage();
    }

    PageDown() {
        this.page--;
        this.UpdatePage();
    }
}