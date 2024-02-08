import { _decorator, Component, Node } from 'cc';
import { MakeLevel } from './MakeLevel';
import { matrix1 } from './Square';
const { ccclass, property } = _decorator;

@ccclass('Item')
export class Item extends Component {
    locate: number[];
    make_level: MakeLevel = null;

    onLoad() {
        this.make_level = this.node.parent.getComponent(MakeLevel);
    }

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
    }

    touchStart() {
        if (this.make_level.mode == 'delete') {
            this.node.destroy();
            matrix1[this.locate[0] * 15 + this.locate[1]].id = -1
        }
    }
}


