import { _decorator, Component, Node, Sprite, SpriteFrame, Color, resources, EventTouch, instantiate, director, Label, Button } from 'cc';
import { LightPiece } from './LightPiece';
import { Num2Color, ColorName, MirrorName, StableName } from './MainTheme'
import { ClearMatrix, matrix1, matrix2, GetColor } from './Square';
import { MapInfo } from './MapInfo';
import { Prefab } from './Prefab';
import { Item } from './Item';
import { LightSource, LightTravel } from './LightTravel';
import { Flower } from './Flower';
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
    prefab_array = new Array<Node>();
    frame_array = new Array<Node>();
    LP_array = new Array<Node>();

    light_array = new Array<Node>();
    flower_array = new Array<Node>();
    mirror_array = new Array<Node>();
    stable_array = new Array<Node>();

    prefab_num = 0;
    active_index = -1;
    mode: Mode = 'none';
    rotate_form: boolean = true;
    fixed_obj_num: number;
    window: Node = null;
    moved: boolean = false;

    onLoad() {
        ClearMatrix();
        this.fixed_obj_num = this.node.children.length;
        this.window = this.node.getChildByName('window');

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
        this.window.on(Node.EventType.TOUCH_START, this.touchStart, this);
    }

    touchStart(event: EventTouch) {
        this.moved = false;
        this.window.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.window.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
    }

    touchEnd(event: EventTouch) {
        if (this.mode != 'add') {
            return;
        }

        let x = event.getUILocation().x - MapInfo.UIwidth / 2;
        let y = event.getUILocation().y - MapInfo.UIheight / 2;
        x = Math.floor((x - MapInfo.xstart1()) / MapInfo.totalsize());
        y = Math.floor((y - MapInfo.ystart1()) / MapInfo.totalsize());

        if (matrix1[x * 15 + y].id != -1) {
            if (this.moved) {
                this.run();
            }
            return;
        }

        let pre_node = this.prefab_array[this.active_index];
        let new_node = instantiate(pre_node);
        this.node.addChild(new_node);

        new_node.setPosition(x * MapInfo.totalsize() + MapInfo.xshift1(), y * MapInfo.totalsize() + MapInfo.yshift1(), 0);
        new_node.getComponent(Prefab).destroy();

        let prefab = pre_node.getComponent(Prefab);
        let item = new_node.addComponent(Item);

        item.id = prefab.id;
        item.dir = 0
        item.locate = [x, y];
        matrix1[x * 15 + y].id = prefab.id;
        matrix1[x * 15 + y].mirrordir = 0;

        switch (prefab.type) {
            case 'light': {
                item.type = 'light';
                item.rotatable = true;
                item.color = prefab.color;
                this.light_array.push(new_node);
                break;
            }
            case 'mirror': {
                item.type = 'mirror';
                item.rotatable = (item.id == 10 || item.id == 13 || item.id == 14) ? false : true;
                if ((item.id > 2 && item.id < 9) || item.id > 14) {
                    new_node.setSiblingIndex(this.fixed_obj_num);
                }
                this.mirror_array.push(new_node);
                break;
            }
            case 'stable': {
                item.type = 'stable';
                item.rotatable = (item.id == 7) ? true : false;
                new_node.setScale(1, 1);
                this.stable_array.push(new_node);
                break;
            }
            case 'flower': {
                item.type = 'flower';
                item.rotatable = false;
                item.color = prefab.color;
                this.flower_array.push(new_node);

                let flower = new_node.addComponent(Flower)
                flower.locate = [x, y];
                flower.color = prefab.color;
                flower.ChangeState();
                break;
            }
            default: break;
        }

        this.run();
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
        this.stable_array.push(new_node);
        this.moved = true;

        new_node.setPosition(x * MapInfo.totalsize() + MapInfo.xshift1(), y * MapInfo.totalsize() + MapInfo.yshift1(), 0);
        new_node.setScale(1, 1);
        new_node.getComponent(Prefab).destroy();

        let item = new_node.addComponent(Item);
        item.id = 102;
        item.dir = 0;
        item.locate = [x, y];
        item.type = 'stable';
        item.rotatable = false;
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
            prefab.color = Num2Color(Number(color_str[i]));
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
            prefab.color = color;
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

    render() {
        for(let i = 0; i < this.LP_array.length; i++) {
            let LP = this.LP_array[i].getComponent(LightPiece);
            let locate = LP.locate;
            let dir = LP.dir;

            let [r, g, b] = GetColor(locate, dir);
            let sprite = LP.getComponent(Sprite);

            if (r == false && g == false && b == false) {
                sprite.color = new Color(0, 0, 0, 0);
            }
            else {
                sprite.color = new Color((r ? 255 : 0), (g ? 255 : 0), (b ? 255 : 0), 255);
            }
        }
    }

    run() {
        for(let i = 0; i < 15 * 15; i++) {
            for(let j = 0; j < 8 * 9; j++) {
                matrix1[i].lightdir[j] = false;
            }
        }
    
        let LS_array = new Array<LightSource>();
        for(let i = 0; i < this.light_array.length; i++) {
            let item = this.light_array[i].getComponent(Item);
            let LS = new LightSource(item.locate, item.dir, item.color);
            LS_array.push(LS);
        }

        LightTravel(LS_array);
        this.render();
    
        for(let i = 0; i < this.flower_array.length; i++) {
            let flower = this.flower_array[i].getComponent(Flower);
            flower.ChangeState();
        }
        
        this.success();
    }

    exit() {
        director.loadScene('FirstPage');
    }

    setRotate() {
        let label = this.node.getChildByName('Rotate').getChildByName('Label').getComponent(Label);
        if(this.rotate_form) {
            this.rotate_form = false;
            label.string = '顺时针';
        }
        else {
            this.rotate_form = true;
            label.string = '逆时针';
        }
    }

    reset() {
        ClearMatrix();
        this.render();

        while (this.light_array.length > 0) {
            let node = this.light_array.pop();
            node.destroy();
        }

        while (this.flower_array.length > 0) {
            let node = this.flower_array.pop();
            node.destroy();
        }

        while (this.mirror_array.length > 0) {
            let node = this.mirror_array.pop();
            node.destroy();
        }

        while (this.stable_array.length > 0) {
            let node = this.stable_array.pop();
            node.destroy();
        }

        let save_button = this.node.getChildByName('Save').getComponent(Button);
        save_button.interactable = false;
    }

    success() {
        let success = true;
        if (this.flower_array.length == 0) {
            success = false;
        }
        else{
            for(let i = 0; i < this.flower_array.length; i++) {
                let flower = this.flower_array[i].getComponent(Flower);
                success &&= flower.state;
            }
        }

        let save_button = this.node.getChildByName('Save').getComponent(Button);
        save_button.interactable = success ? true : false;
    }

    generateCode() {
        console.log('hhh');
    }

    update(deltaTime: number) {
        
    }
}


