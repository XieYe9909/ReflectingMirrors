import { _decorator, Component, Node, Sprite, SpriteFrame, Color, resources, EventTouch, instantiate, director } from 'cc';
import { LightPiece } from './LightPiece';
import { Num2Color, ColorName, MirrorName, StableName } from './MainTheme'
import { ClearMatrix, matrix1, matrix2, GetColor } from './Square';
import { MapInfo } from './MapInfo';
import { Prefab } from './Prefab';
import { Item } from './Item';
const { ccclass, property } = _decorator;

function GenerateLocate(i: number): number[] {
    switch (Math.floor(i / 12)) {
        case 0: return [i, 1];
        case 1: return [i - 12, 0];
        case 2: return [i - 24, -1];
        case 3: return [i - 36, -2];
        default: return [0, 0];
    }
}

type Mode = 'add' | 'delete' | 'none';

@ccclass('MakeLevel')
export class MakeLevel extends Component {
    LP_array = new Array<Node>();
    prefab_array = new Array<Node>();
    frame_array = new Array<Node>();
    prefab_num = 0;
    active_index = -1;
    mode: Mode = 'none';

    onLoad() {
        ClearMatrix();

        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                for (let dir = 0; dir < 8; dir++) {
                    let node = new Node('light piece');
                    node.layer = 33554432;
                    this.node.addChild(node);

                    if(dir % 2 == 1) {
                        node.setScale(1.41421, 1);
                    }
                    else {
                        node.setScale(1, 1);
                    }

                    node.setPosition(i * MapInfo.totalsize() + MapInfo.xshift1(), j * MapInfo.totalsize() + MapInfo.yshift1(), 0);
                    node.setRotationFromEuler(0, 0, dir * 45);

                    let LP = node.addComponent(LightPiece);
                    LP.locate = [i, j];
                    LP.dir = dir;

                    this.LP_array.push(node);
                }
            }
        }
        
        this.setLight();
        this.setMirror();
        this.setStable();
        this.setFlower();

        let delete_button = this.node.getChildByName('delete-button');
        this.prefab_array.push(delete_button);

        let prefab = delete_button.addComponent(Prefab);
        prefab.index = this.prefab_num++;
    }

    start() {
        let window = this.node.getChildByName('window');
        window.on(Node.EventType.TOUCH_START, this.touchStart, this);
        window.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
    }

    touchStart(event: EventTouch) {
        if (this.mode != 'add') {
            return;
        }

        let x = event.getUILocation().x - MapInfo.UIwidth / 2;
        let y = event.getUILocation().y - MapInfo.UIheight / 2;
        x = Math.floor((x - MapInfo.xstart1()) / MapInfo.totalsize());
        y = Math.floor((y - MapInfo.ystart1()) / MapInfo.totalsize());

        if (matrix1[x * 15 + y].id != -1) {
            return;
        }

        let pre_node = this.prefab_array[this.active_index];
        let new_node = instantiate(pre_node);
        this.node.addChild(new_node);

        new_node.setPosition(x * MapInfo.totalsize() + MapInfo.xshift1(), y * MapInfo.totalsize() + MapInfo.yshift1(), 0);
        new_node.getComponent(Prefab).destroy();
        let item = new_node.addComponent(Item);
        item.locate = [x, y];

        let prefab = pre_node.getComponent(Prefab);
        matrix1[x * 15 + y].id = prefab.id;
        switch (prefab.type) {
            case 'light': {
                break;
            }
            case 'mirror': {
                break;
            }
            case 'stable': {
                new_node.setScale(1, 1);
                break;
            }
            case 'flower': {
                new_node.setScale(1, 1);
                break;
            }
        }
    }

    touchMove(event: EventTouch) {
        if (this.mode != 'add' || this.active_index != 23) {
            return;
        }

        let x = event.getUILocation().x - MapInfo.UIwidth / 2;
        let y = event.getUILocation().y - MapInfo.UIheight / 2;
        x = Math.floor((x - MapInfo.xstart1()) / MapInfo.totalsize());
        y = Math.floor((y - MapInfo.ystart1()) / MapInfo.totalsize());

        if (matrix1[x * 15 + y].id != -1) {
            return;
        }

        let pre_node = this.prefab_array[this.active_index];
        let new_node = instantiate(pre_node);
        this.node.addChild(new_node);

        new_node.setPosition(x * MapInfo.totalsize() + MapInfo.xshift1(), y * MapInfo.totalsize() + MapInfo.yshift1(), 0);
        new_node.setScale(1, 1);
        new_node.getComponent(Prefab).destroy();
        let item = new_node.addComponent(Item);
        item.locate = [x, y];
        matrix1[x * 15 + y].id = 102;
    }

    setLight() {
        let color_str: string = '4213567';
        for (let i = 0; i < 7; i++) {
            let color_name = ColorName[Number(color_str[i])];
            let locate = GenerateLocate(i);
            this.setFrame(locate);

            let light = new Node('light');
            this.prefab_array.push(light);
            this.node.addChild(light);

            light.layer = 33554432;
            light.setPosition(locate[0] * MapInfo.totalsize2x() + MapInfo.xshift2(), locate[1] * MapInfo.totalsize2y() + MapInfo.yshift2(), 0);

            let sprite = light.addComponent(Sprite);
            let path = 'lights/' + color_name + '/spriteFrame';
            resources.load(path, SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                sprite.spriteFrame = spriteFrame;
            });

            let prefab = light.addComponent(Prefab);
            prefab.id = 101;
            prefab.index = this.prefab_num++;
            prefab.type = 'light';
        }
    }

    setMirror() {
        let i = 12;
        for (let id = 1; id <= 18; id++) {
            let mirror_name = MirrorName[id];
            if (mirror_name === undefined) {
                continue;
            }

            let locate = GenerateLocate(i++);
            this.setFrame(locate);

            let mirror = new Node('mirror');
            this.prefab_array.push(mirror);
            this.node.addChild(mirror);

            mirror.layer = 33554432;
            mirror.setPosition(locate[0] * MapInfo.totalsize2x() + MapInfo.xshift2(), locate[1] * MapInfo.totalsize2y() + MapInfo.yshift2(), 0);

            let sprite = mirror.addComponent(Sprite);
            let path = 'mirrors/' + mirror_name + '/spriteFrame';
            resources.load(path, SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                sprite.spriteFrame = spriteFrame;
            });

            let prefab = mirror.addComponent(Prefab);
            prefab.id = id;
            prefab.index = this.prefab_num++;
            prefab.type = 'mirror';
        }
    }

    setStable() {
        let stable_name = ['obstacle', 'guangshan', 'chuansong', 'xuanzhuan_shun', 'xuanzhuan_ni'];
        let stable_id = [102, 7, 10, 13, 14];

        for (let i = 0; i < 5; i++) {
            let locate = GenerateLocate(28 + i);
            this.setFrame(locate);

            let stable = new Node('stable');
            this.prefab_array.push(stable);
            this.node.addChild(stable);

            stable.layer = 33554432;
            stable.setPosition(locate[0] * MapInfo.totalsize2x() + MapInfo.xshift2(), locate[1] * MapInfo.totalsize2y() + MapInfo.yshift2(), 0);

            if (i == 0) {
                stable.setScale(0.9, 0.9);
            }

            let sprite = stable.addComponent(Sprite);
            let path = 'stables/' + stable_name[i] + '/spriteFrame';
            resources.load(path, SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                sprite.spriteFrame = spriteFrame;
            });

            let prefab = stable.addComponent(Prefab);
            prefab.id = stable_id[i];
            prefab.index = this.prefab_num++;
            prefab.type = 'stable';
        }
    }

    setFlower() {
        let color_str: string = '42135670';
        for (let i = 0; i < 8; i++) {
            let color = Num2Color(Number(color_str[i]));
            let locate = GenerateLocate(36 + i);
            this.setFrame(locate);

            let flower = new Node('flower');
            this.prefab_array.push(flower);
            this.node.addChild(flower);

            flower.layer = 33554432;
            flower.setScale(0.9, 0.9);
            flower.setPosition(locate[0] * MapInfo.totalsize2x() + MapInfo.xshift2(), locate[1] * MapInfo.totalsize2y() + MapInfo.yshift2(), 0);

            let sprite = flower.addComponent(Sprite);
            resources.load('flower/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                sprite.color = new Color(color[0] ? 255 : 0, color[1] ? 255 : 0, color[2] ? 255 : 0, 255);
                sprite.spriteFrame = spriteFrame;
            });

            let prefab = flower.addComponent(Prefab);
            prefab.id = 0;
            prefab.index = this.prefab_num++;
            prefab.type = 'flower';
        }
    }

    setFrame(locate: number[]) {
        let frame = new Node('frame');
        this.node.addChild(frame);
        this.frame_array.push(frame);

        frame.setPosition(locate[0] * MapInfo.totalsize2x() + MapInfo.xshift2(), locate[1] * MapInfo.totalsize2y() + MapInfo.yshift2(), 0);
        frame.active = false;

        let sprite = frame.addComponent(Sprite);
        resources.load('frame/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
            sprite.spriteFrame = spriteFrame;
        });
    }

    exit() {
        director.loadScene('FirstPage');
    }

    update(deltaTime: number) {
        
    }
}


