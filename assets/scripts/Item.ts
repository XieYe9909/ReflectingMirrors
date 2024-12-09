import { _decorator, Component, EventTouch, Node } from 'cc';
import { MakeLevel } from './MakeLevel';
import { matrix1 } from './Square';
import { MapInfo } from './MapInfo';
const { ccclass, property } = _decorator;

@ccclass('Item')
export class Item extends Component {
    id: number;
    dir: number;
    rotatable :boolean;
    isClick: boolean = false;
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
        else {
            this.isClick = true;
            this.node.setSiblingIndex(this.make_level.node.children.length - 1)
            this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
            this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
            this.scheduleOnce(function(){
                this.isClick = false;
            }, 0.1)
        }
    }

    touchEnd(event: EventTouch) {
        if (this.isClick) {
            if (this.rotatable) {
                this.dir = this.make_level.rotate_form ? ((this.dir + 1) % 8) : ((this.dir + 7) % 8)
                matrix1[this.locate[0] * 15 + this.locate[1]].mirrordir = this.dir;
                this.node.setRotationFromEuler(0, 0, this.dir * 45);
            }

            if ((this.id > 2 && this.id < 9) || this.id > 14) {
                this.node.setSiblingIndex(0);
            }
            this.node.setPosition(this.locate[0] * MapInfo.totalsize() + MapInfo.xshift1(), this.locate[1] * MapInfo.totalsize() + MapInfo.yshift1(), 0);
        }
        else {
            
        }
    }

    touchMove(event: EventTouch) {

    }
}


