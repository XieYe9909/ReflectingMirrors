import { _decorator, Component, EventTouch, Node } from 'cc';
import { MakeLevelInterface } from './MakeLevelInterface';
import { Flower } from './Flower';
import { Type } from './Prefab';
import { matrix1 } from './Square';
import { MapInfo } from './MapInfo';
import { getIndexByID } from './utils';
const { ccclass, property } = _decorator;

@ccclass('Item')
export class Item extends Component {
    id: number;
    dir: number;
    locate: number[];
    color: boolean[] = [false, false, false];
    rotatable :boolean;
    make_level: MakeLevelInterface = null;
    type: Type = null;
    isClick: boolean = false;

    onLoad() {
        this.make_level = this.node.parent.getComponent("MakeLevel");
    }

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
    }

    touchStart() {
        if (this.make_level.mode == 'delete') {
            this.delete();
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
                this.make_level.run();
            }

            if ((this.id > 2 && this.id < 9) || (this.id > 14 && this.id < 100)) {
                this.node.setSiblingIndex(this.make_level.fixed_obj_num);  // After the "window" layer.
            }

            this.node.setPosition(this.locate[0] * MapInfo.totalsize() + MapInfo.xshift1(), this.locate[1] * MapInfo.totalsize() + MapInfo.yshift1(), 0);
        }
        else {
            let x = event.getUILocation().x - 562.5;
            let y = event.getUILocation().y - 1218;

            if (x >= MapInfo.xstart1() && x <= MapInfo.xend1() && y >= MapInfo.ystart1() && y <= MapInfo.yend1()) {
                let new_x = Math.floor((x - MapInfo.xstart1()) / MapInfo.totalsize());
                let new_y = Math.floor((y - MapInfo.ystart1()) / MapInfo.totalsize());

                if (matrix1[new_x * 15 + new_y].id == -1) {
                    matrix1[this.locate[0] * 15 + this.locate[1]].id = -1;
                    matrix1[new_x * 15 + new_y].id = this.id;
                    matrix1[new_x * 15 + new_y].mirrordir = this.dir;
                    this.locate[0] = new_x;
                    this.locate[1] = new_y;
                    
                    if (this.type == 'flower') {
                        let flower = this.node.getComponent(Flower);
                        flower.locate[0] = new_x;
                        flower.locate[1] = new_y;
                    }

                    this.make_level.run();
                }

                if ((this.id > 2 && this.id < 9) || (this.id > 14 && this.id < 100)) {
                    this.node.setSiblingIndex(this.make_level.fixed_obj_num);  // After the "window" layer.
                }

                this.node.setPosition(this.locate[0] * MapInfo.totalsize() + MapInfo.xshift1(), this.locate[1] * MapInfo.totalsize() + MapInfo.yshift1(), 0);
            }
            else {
                this.delete();
            }
        }
    }

    touchMove(event: EventTouch) {
        this.node.setPosition(this.node.getPosition().x + event.getUIDelta().x, this.node.getPosition().y + event.getUIDelta().y, 0);
    }

    delete() {
        switch (this.type) {
            case 'light': {
                let index = getIndexByID(this.node, this.make_level.light_array);
                if (index !== -1) {
                    this.make_level.light_array.splice(index, 1);
                }
                break;
            }
            case 'flower': {
                let index = getIndexByID(this.node, this.make_level.flower_array);
                if (index !== -1) {
                    this.make_level.flower_array.splice(index, 1);
                }
                break;
            }
            case 'mirror': {
                let index = getIndexByID(this.node, this.make_level.mirror_array);
                if (index !== -1) {
                    this.make_level.mirror_array.splice(index, 1);
                }
                break;
            }
            case 'stable': {
                let index = getIndexByID(this.node, this.make_level.stable_array);
                if (index !== -1) {
                    this.make_level.stable_array.splice(index, 1);
                }
                break;
            }
            default: break;
        }

        this.node.destroy();
        matrix1[this.locate[0] * 15 + this.locate[1]].id = -1

        if (this.type == 'flower') {
            this.make_level.success();
        }
        else {
            this.make_level.run();
        }
    }
}
