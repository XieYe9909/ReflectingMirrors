import { _decorator, Component, Button, Label } from 'cc';
import { TotalBasicLevel, TotalExtraLevel, ExtraLevelStart, BasicLevelPerPage, ExtraLevelPerPage } from './LevelData';
import { LevelSelectButton } from './LevelSelectButton';
import { CurrentLevel } from './FirstPage'
const { ccclass } = _decorator;

@ccclass('LevelSelect')
export class LevelSelect extends Component {
    page: number;
    max_page: number;

    onLoad() {
        if (CurrentLevel[0] >= ExtraLevelStart) {
            this.page = Math.floor((CurrentLevel[0] - ExtraLevelStart) / ExtraLevelPerPage);
            this.max_page = Math.ceil(TotalExtraLevel / ExtraLevelPerPage);
        } else {
            this.page = Math.floor(CurrentLevel[0] / BasicLevelPerPage);
            this.max_page = Math.ceil(TotalBasicLevel / BasicLevelPerPage);
        }
        this.updatePage();
    }

    updatePage() {
        // let label = this.node.getChildByName('CurrentPage').getComponent(Label);
        // label.string = String(this.page + 1);

        let levels = this.node.children;
        for (var i=0; i<levels.length; i++) {
            let button = levels[i].getComponent('LevelSelectButton') as (LevelSelectButton | null);
            if (button == null) continue;
            button.onLoad();
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

    pageUp() {
        this.page++;
        this.updatePage();
    }

    pageDown() {
        this.page--;
        this.updatePage();
    }
}