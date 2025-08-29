import { _decorator, Component, Node, Sprite, SpriteFrame, Color, resources, EventTouch, instantiate, director, Label, Button, native } from 'cc';
import { LightPiece } from './LightPiece';
import { Num2Color, ColorName, MirrorName, StableName } from './MainTheme'
import { ClearMatrix, matrix1, matrix2, GetColor } from './Square';
import { MapInfo } from './MapInfo';
import { Prefab } from './Prefab';
import { Item } from './Item';
import { LightSource, LightTravel } from './LightTravel';
import { Flower } from './Flower';
import { MakeLevelInterface, Mode } from './MakeLevelInterface';
import { SaveLevel } from './Storage';
import { showUserConfirm, showWechatInputName } from './utils';
const { ccclass, property } = _decorator;

// 声明 wx 变量以避免找不到名称错误
declare const wx: any;
const MAX_MIRROR_NUM = 24;

function GenerateLocate(i: number): number[] {
    switch (Math.floor(i / 12)) {
        case 0: return [i, 1];
        case 1: return [i - 12, 0];
        case 2: return [i - 24, -1];
        case 3: return [i - 36, -2];
        default: return [0, 0];
    }
}

@ccclass('MakeLevel')
export class MakeLevel extends Component implements MakeLevelInterface {
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

    async exit() {
        let confirm = await showUserConfirm('未保存的关卡数据将会丢失。确认退出？');
        if (!confirm) {
            return;
        }
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

        let export_button = this.node.getChildByName('Export').getComponent(Button);
        export_button.interactable = false;

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

        let export_button = this.node.getChildByName('Export').getComponent(Button);
        export_button.interactable = success && this.mirror_array.length > 0 && this.mirror_array.length <= MAX_MIRROR_NUM ? true : false;

        let save_button = this.node.getChildByName('Save').getComponent(Button);
        save_button.interactable = success && this.mirror_array.length > 0 && this.mirror_array.length <= MAX_MIRROR_NUM ? true : false;
    }

    generateCode() {
        // prepare
        var Num2CharT = function(i: number) {
            return String.fromCharCode(i + 65);
        };
        var Num2CharX = function(i: number): string {
            if(i < 10) return String(i);
            else return String.fromCharCode(i + 87);
        };
        var Num2CharY = function(i: number): string {
            return String.fromCharCode(i + 102);
        };
        var Color2Num = function(color: boolean[]): number {
            let a = color[0] ? 1 : 0;
            let b = color[1] ? 1 : 0;
            let c = color[2] ? 1 : 0;
            let num = a*4 + b*2 + c;
            return num;
        };
        var StableID2Num = function(i : number): number {
            switch(i) {
                case 7 : return 1;
                case 10 : return 2;
                case 13 : return 3;
                case 14 : return 4;
                case 102 : return 5;
                default : return -1;
            }
        };
        var CmpItem = function(a:Item, b:Item) {
            // assert a.type == b.type
            let a_color = Color2Num(a.color), b_color = Color2Num(b.color);
            if (a_color != b_color) {
                return a_color - b_color;
            }
            else if (a.locate[0] == -1) {
                return 0;
            }
            else if (a.id != b.id) {
                return a.id - b.id;
            }
            else if (a.locate[0] != b.locate[0]) {
                return a.locate[0] - b.locate[0];
            }
            else {
                return a.locate[1] - b.locate[1];
            }
        }

        let code = '';
        let curr_type = 0;
        let curr_id = -1;
        let curr_row = -1;
        
        // process light source
        let light_list = new Array<Item>();
        for (let ls of this.light_array) {
            light_list.push(ls.getComponent(Item));
        }
        light_list.sort(CmpItem);
        for(let item of light_list) {
            let type = Color2Num(item.color);
            if (type != curr_type) {
                code += Num2CharT(type);
                curr_type = type;
                curr_row = -1;
            }
            if (curr_row != item.locate[0]) {
                code += Num2CharX(item.locate[0]);
                curr_row = item.locate[0];
            }
            code += Num2CharY(item.locate[1]);
            code += Num2CharX(item.dir);
        }

        // process flower
        let flower_list = new Array<Item>();
        for (let ls of this.flower_array) {
            flower_list.push(ls.getComponent(Item));
        }
        flower_list.sort(CmpItem);
        for(let item of flower_list) {
            let type = Color2Num(item.color) + 8;
            if (type != curr_type) {
                code += Num2CharT(type);
                curr_type = type;
                curr_row = -1;
            }
            if (curr_row != item.locate[0]) {
                code += Num2CharX(item.locate[0]);
                curr_row = item.locate[0];
            }
            code += Num2CharY(item.locate[1]);
        }

        // process mirror
        let mirror_list = new Array<Item>();
        for (let ls of this.mirror_array) {
            mirror_list.push(ls.getComponent(Item));
        }
        let mirror_num = new Array<number>(20);
        for(let i=0; i<20; i++) mirror_num[i] = 0;
        mirror_list.sort(CmpItem);
        for(let item of mirror_list) {
            let type = 16;
            if (type != curr_type) {
                code += Num2CharT(type);
                curr_type = type;
            }
            mirror_num[item.id] += 1;
        }
        for(let i=0; i<20; i++) {
            if (mirror_num[i] > 0) {
                code += Num2CharX(i);
                code += Num2CharX(mirror_num[i]);
            }
        }

        // process stable
        let stable_list = new Array<Item>();
        for (let ls of this.stable_array) {
            stable_list.push(ls.getComponent(Item));
        }
        stable_list.sort(CmpItem);
        for(let item of stable_list) {
            let type = StableID2Num(item.id) + 16;
            if (type != curr_type) {
                code += Num2CharT(type);
                curr_type = type;
                curr_row = -1;
            }
            if (curr_row != item.locate[0]) {
                code += Num2CharX(item.locate[0]);
                curr_row = item.locate[0];
            }
            code += Num2CharY(item.locate[1]);
            if (item.rotatable) code += Num2CharX(item.dir);
        }

        // compress code
        var PrintContinuousChar = function(start:number, end:number) {
            let result = "";
            if (end - start >= 2) {
                result += String.fromCharCode(start);
                result = result.concat("-");
                result += String.fromCharCode(end);
            }
            else if (end != start){
                result += String.fromCharCode(start);
                result += String.fromCharCode(end);
            }
            else {
                result += String.fromCharCode(start);
            }
            return result;
        };
        let compressed_code = "";
        let need_print = false;
        let last_ch = 0;
        let first_ch = 0;
        for (let i=0; i<code.length; i++) {
            let ch = code.charCodeAt(i);
            if (ch < 102 || ch > 116) {
                if (need_print) {
                    compressed_code += PrintContinuousChar(first_ch, last_ch);
                    need_print = false;
                }
                last_ch = 0;
                compressed_code += code[i];
                continue;
            }
            if (ch - last_ch != 1) {
                if (need_print) {
                    compressed_code += PrintContinuousChar(first_ch, last_ch);
                }
                first_ch = ch;
                last_ch = ch;
            }
            else {
                last_ch = ch;
            }
            need_print = true;
        }
        if (need_print) {
            compressed_code += PrintContinuousChar(first_ch, last_ch);
        }

        return compressed_code;
    }

    copyCode() {
        let code = this.generateCode();

        if (typeof wx !== 'undefined') {
            console.log("Copying to clipboard...");
            wx.setClipboardData({
                data: code},
            ).then(() => {
                wx.showToast({
                  title: '已复制关卡代码到剪贴板',
                })
            }).catch(err => {
              console.error('复制失败', err)
            })
        }
        else {
            console.log(code);
        }
    }

    async saveLevel() {
        if (typeof wx == 'undefined') {
            console.log('Not in WeChat environment');

            let name = "测试关卡";
            let code = this.generateCode();
            let mirror_num = this.mirror_array.length;
            SaveLevel(name, code, mirror_num, false);

            return null;  // 如果不是微信环境，直接返回 null
        }

        try {
            let name = await showWechatInputName();
            if (name !== null) {
                if (name.length == 0) {
                    name = '自定义关卡';
                }
                let code = this.generateCode();
                let mirror_num = this.mirror_array.length;
                let success = SaveLevel(name, code, mirror_num, false);
                
                if (success) {
                    wx.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });
                }
                else {
                    wx.showToast({
                        title: '存档已满，无法保存',
                        icon: 'error'
                    });
                }
            }
            else {
                console.log('用户取消了输入');
            }
        }
        catch (error) {
            console.error('输入过程出错:', error);
            wx.showToast({
                title: '输入失败',
                icon: 'error'
            });
        }
    }

    // async showWechatInputName(): Promise<string | null> {
    //     let title = '自定义关卡名（15 字符以内）';
    //     let content = '';
    //     let placeholder = '请输入...';
    //     let confirmText = '确定';
    //     let cancelText = '取消';
    //     const MAX_LENGTH = 15;

    //     return new Promise((resolve) => {
    //         wx.showModal({
    //         title,
    //         editable: true,
    //         content,
    //         placeholderText: placeholder,
    //         confirmText,
    //         cancelText,
    //         success: (res: { confirm: any; content: any; }) => {
    //             if (res.confirm) {
    //                 // 用户点击确定，返回输入的内容
    //                 let input = res.content || '';
    //                 if (input.length > MAX_LENGTH) {
    //                     wx.showToast({
    //                         title: '最多输入 ${MAX_LENGTH} 个字符',
    //                         icon: 'none'
    //                     });
    //                     input = input.substring(0, MAX_LENGTH);
    //                 }
    //                 resolve(input);
    //             }
    //             else {
    //                 // 用户取消输入
    //                 resolve(null);
    //             }
    //         },
    //         fail: () => {
    //             // 调用失败时也返回 null
    //             resolve(null);
    //         }
    //         });
    //     });
    // }

    update(deltaTime: number) {
        
    }
}


