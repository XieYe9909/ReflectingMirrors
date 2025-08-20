import { _decorator, Component, EventTouch, Node, Sprite } from 'cc';
import { MakeLevelInterface } from './MakeLevelInterface';
const { ccclass, property } = _decorator;

export type Type = 'light' | 'mirror' | 'stable' | 'flower';

/** 在關卡創作的界面上，物品欄中的所有物品均包含 Prefab 屬性，包括：Light, Mirror, Stable, Flower。 */
@ccclass('Prefab')
export class Prefab extends Component {
    id: number = null;
    index: number = 0;
    color: boolean[] = [false, false, false];
    type: Type = null;
    make_level: MakeLevelInterface = null;

    onLoad() {
        this.make_level = this.node.parent.getComponent("MakeLevel");
    }

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
    }

    touchStart(event: EventTouch) {
        let index = this.make_level.active_index;
        if (this.index == this.make_level.prefab_num - 1) { // delete button
            if (index != this.index) {
                if (index != -1) {
                    this.make_level.frame_array[index].active = false;
                }

                this.make_level.active_index = this.index;
                this.make_level.mode = 'delete';
                this.node.getComponent(Sprite).grayscale = false;
            }
            else {
                this.make_level.active_index = -1;
                this.make_level.mode = 'none';
                this.node.getComponent(Sprite).grayscale = true;
            }
        }
        else {
            if (index != this.index) {
                if (index != -1) {
                    if (index == this.make_level.prefab_num - 1) {
                        let delete_button = this.make_level.prefab_array[index];
                        delete_button.getComponent(Sprite).grayscale = true;
                    }
                    else {
                        this.make_level.frame_array[index].active = false;
                    }
                }

                this.make_level.active_index = this.index;
                this.make_level.mode = 'add';
                this.make_level.frame_array[this.index].active = true;
            }
            else {
                this.make_level.active_index = -1;
                this.make_level.mode = 'none';
                this.make_level.frame_array[this.index].active = false;
            }
        }
    }
}
