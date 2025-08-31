
import { _decorator, Component, Node, Sprite, SpriteFrame, Color, Button, Label, sys, resources, director } from 'cc';
import { CurrentTotalLevel, Level, Name, Diff, Des, Suc } from './LevelData';
import { CurrentLevel } from './FirstPage';
import { LightPiece } from './LightPiece';
import { LightSource, LightTravel } from './LightTravel';
import { ClearMatrix, matrix1, matrix2, GetColor } from './Square';
import { MirrorState, Mirror } from './Mirror';
import { MapInfo } from './MapInfo';
import { Flower } from './Flower';
import { MainThemeInterface } from './MainThemeInterface';
import { generateLocate, showUserConfirm } from './Utils';
const { ccclass } = _decorator;

function Char2Num(str: string): number {
    if(isNaN(Number(str))) return str.charCodeAt(0) - 87;
    else return Number(str);
}

export function Num2Color(num: Number): boolean[] {
    switch(num) {
        case 0: return [false, false, false];
        case 1: return [false, false, true];
        case 2: return [false, true, false];
        case 3: return [false, true, true];
        case 4: return [true, false, false];
        case 5: return [true, false, true];
        case 6: return [true, true, false];
        case 7: return [true, true, true];
        default: return null;
    }
}

export enum ColorName {
    black,
    blue,
    green,
    cyan,
    red,
    magenta,
    yellow,
    white
}

export enum MirrorName {
    zhijiao = 1,
    xiejiao,
    fenguang,
    lvguang_r,
    lvguang_g,
    lvguang_b,
    sanleng = 8,
    bianse,
    chuansong,
    liangzi,
    xuanzhuan_shun =13,
    xuanzhuan_ni,
    zese_r,
    zese_g,
    zese_b,
    duoyong
}

export enum StableName {
    guangshan = 7,
    chuansong = 10,
    xuanzhuan_shun = 13,
    xuanzhuan_ni = 14,
    obstacle = 102
}

export function Char2Color(str: string): boolean[] {
    let color = new Array<boolean>(3);
    let num = Char2Num(str);
    for(let i=2; i>=0; i--) {
        color[i] = Boolean(num % 2);
        num = (num - num % 2) / 2;
    }
    return color;
}

export function Char2ColorName(str: string): string {
    let num = Char2Num(str);
    switch(num) {
        case 1: return 'blue';
        case 2: return 'green';
        case 3: return 'cyan';
        case 4: return 'red';
        case 5: return 'magenta';
        case 6: return 'yellow';
        case 7: return 'white';
        default: return null;
    }
}

export function Color2Name(color: boolean[]): string {
    let idx = 0;
    if (color[0]) idx += 4;
    if (color[1]) idx += 2;
    if (color[2]) idx += 1;
    switch(idx) {
        case 1: return 'blue';
        case 2: return 'green';
        case 3: return 'cyan';
        case 4: return 'red';
        case 5: return 'magenta';
        case 6: return 'yellow';
        case 7: return 'white';
        default: return null;
    }
}

export function Id2MirrorName(id: number) {
    switch(id) {
        case 1: return 'zhijiao';
        case 2: return 'xiejiao';
        case 3: return 'fenguang';
        case 4: return 'lvguang_r';
        case 5: return 'lvguang_g';
        case 6: return 'lvguang_b';
        case 8: return 'sanleng';
        case 9: return 'bianse';
        case 10: return 'chuansong';
        case 11: return 'liangzi';
        case 13: return 'xuanzhuan_shun';
        case 14: return 'xuanzhuan_ni';
        case 15: return 'zese_r';
        case 16: return 'zese_g';
        case 17: return 'zese_b';
        case 18: return 'duoyong'
        default: return null;
    }
}

@ccclass('MainTheme')
export class MainTheme extends Component implements MainThemeInterface {
    level_index: number;
    level_name: string;
    level_code: string;
    level_difficulty: number;
    describe_str: string;
    success_str: string;
    level_flag: boolean;  // 关卡是否成功加载

    rotate_form: boolean;
    // success: boolean;
    flower_array = new Array<Node>();
    mirror_array = new Array<Node>();
    obj_array = new Array<Node>();
    LP_array = new Array<Node>();
    LS_array = new Array<LightSource>();
    children_num: number;
    tot_level_num: number;  // 总关卡数

    customized_level: boolean;  // 是否为自定义关卡

    onLoad() {
        ClearMatrix();
        this.initLightPiece();

        this.level_index = CurrentLevel[0] - 1;
        this.level_name = Name[this.level_index];
        this.level_code = Level[this.level_index];
        this.level_difficulty = Diff[this.level_index];
        this.describe_str = Des[this.level_index];
        this.success_str = Suc[this.level_index];
        this.customized_level = false;
        this.tot_level_num = CurrentTotalLevel;
        this.level_flag = this.setLevel();
    }

    initLightPiece() {
        let i:number, j:number, dir:number;
        for(i=0; i<15; i++) {
            for(j=0; j<15; j++){
                for(dir=0; dir<8; dir++){
                    let node = new Node('LP');
                    node.layer = 33554432;
                    this.node.addChild(node);

                    if(dir % 2 == 1) {
                        node.setScale(1.41421, 1);
                    }
                    else {
                        node.setScale(1, 1);
                    }

                    node.setPosition(i*MapInfo.totalsize() + MapInfo.xshift1(), j*MapInfo.totalsize() + MapInfo.yshift1(), 0);
                    node.setRotationFromEuler(0, 0, dir*45);

                    let LP = node.addComponent(LightPiece);
                    LP.locate = [i, j];
                    LP.dir = dir;

                    this.LP_array.push(node);
                }
            }
        }
    }

    start() {
        if(!this.level_flag) return;
        this.children_num = this.node.children.length;

        let L_array = new Array<LightSource>(this.LS_array.length);
        for(let i=0; i<L_array.length; i++) {
            let LS = this.LS_array[i];
            L_array[i] = new LightSource(LS.locate, LS.dir, LS.color);
        }
        LightTravel(L_array);
        this.drawLight();
        
        for(let i=0; i<this.flower_array.length; i++) {
            let flower = this.flower_array[i].getComponent(Flower);
            flower.ChangeState();
        }
        this.success();
    }

    setLight(locate: number[], color: boolean[], dir: number) {
        let color_name = Color2Name(color);

        let node = new Node('light');
        this.node.addChild(node);

        node.layer = 33554432;
        node.setPosition(locate[0]*MapInfo.totalsize() + MapInfo.xshift1(), locate[1]*MapInfo.totalsize() + MapInfo.yshift1(), 0);
        node.setRotationFromEuler(0, 0, dir * 45);
        matrix1[locate[0]*15 + locate[1]].id = 101;

        let sprite = node.addComponent(Sprite);
        let path = 'lights/' + color_name + '/spriteFrame';
        resources.load(path, SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
            sprite.spriteFrame = spriteFrame;
        });

        let LS = new LightSource(locate, dir, color);
        this.LS_array.push(LS);
        this.obj_array.push(node);
    }

    setFlower(locate: number[], color: boolean[]) {
        let node = new Node('flower');
        this.node.addChild(node);

        node.layer = 33554432;
        node.setSiblingIndex(0);
        node.setPosition(locate[0]*MapInfo.totalsize() + MapInfo.xshift1(), locate[1]*MapInfo.totalsize() + MapInfo.yshift1(), 0);
        matrix1[locate[0]*15 + locate[1]].id = 0;

        let sprite = node.addComponent(Sprite);
        resources.load('flower/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
            sprite.spriteFrame = spriteFrame;
        });

        let flower = node.addComponent(Flower);
        flower.locate[0] = locate[0];
        flower.locate[1] = locate[1];
        flower.color[0] = color[0];
        flower.color[1] = color[1];
        flower.color[2] = color[2];
        flower.ChangeState();

        this.flower_array.push(node);
    }

    setMirror(id_arr: number[], num_arr: number[]) {
        let type_num = id_arr.length;
        for(let i=0; i<type_num; i++) {
            let id = id_arr[i];
            let num = num_arr[i];
            for(let k=0; k<num; k++) {
                let node = new Node('mirror');
                this.node.addChild(node);
                node.layer = 33554432;
                if((id>2 && id<9) || id>14) node.setSiblingIndex(0);

                let sprite = node.addComponent(Sprite);
                let mirror_name = Id2MirrorName(id);
                let path = 'mirrors/' + mirror_name + '/spriteFrame';
                resources.load(path, SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                    sprite.spriteFrame = spriteFrame;
                });

                let mirror = node.addComponent(Mirror);
                mirror.id = id;
                if(id == 10 || id == 13 || id == 14) mirror.rotatable = false;
                else mirror.rotatable = true;

                this.mirror_array.push(node);
            }
        }

        if (this.customized_level) {
            return;  // 自定义关卡的镜子状态在 MyLevel 中设置
        }

        let level_name = 'Level' + (this.level_index + 1);
        let MS_str = sys.localStorage.getItem(level_name);
        let MS_array: MirrorState[];
        
        if(MS_str == null || MS_str.length == 0) {
            MS_array = new Array<MirrorState>();
            for(let i=0; i<this.mirror_array.length; i++) {
                let mirror_state = new MirrorState(0, 2, generateLocate(i));
                MS_array.push(mirror_state);
            }
            sys.localStorage.setItem(level_name, JSON.stringify(MS_array));
        }
        else {
            MS_array = JSON.parse(MS_str);
            if(MS_array.length != this.mirror_array.length) {
                while(MS_array.length>0) MS_array.pop();
                for(let i=0; i<this.mirror_array.length; i++) {
                    let mirror_state = new MirrorState(0, 2, generateLocate(i));
                    MS_array.push(mirror_state);
                }

                let LevelState: boolean[] = JSON.parse(sys.localStorage.getItem('LevelState'));
                LevelState[this.level_index] = false;
                sys.localStorage.setItem('LevelState', JSON.stringify(LevelState));
                sys.localStorage.setItem(level_name, JSON.stringify(MS_array));
            }
        }

        for(let i=0; i<this.mirror_array.length; i++) {
            this.mirror_array[i].getComponent(Mirror).SetMirror(MS_array[i]);
        }
    }

    setGuangshan(locate: number[], dir: number) {
        let node = new Node('guangshan');
        this.node.addChild(node);

        node.layer = 33554432;
        node.setSiblingIndex(0);
        node.setPosition(locate[0]*MapInfo.totalsize() + MapInfo.xshift1(), locate[1]*MapInfo.totalsize() + MapInfo.yshift1(), 0);
        node.setRotationFromEuler(0, 0, dir*45);
        matrix1[locate[0]*15 + locate[1]].id = 7;
        matrix1[locate[0]*15 + locate[1]].mirrordir = dir;

        let sprite = node.addComponent(Sprite);
        resources.load('stables/guangshan/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
            sprite.spriteFrame = spriteFrame;
        });

        this.obj_array.push(node);
    }

    setStable(locate: number[], id: number) {
        let node = new Node('stable');
        this.node.addChild(node);
        node.layer = 33554432;
        node.setPosition(locate[0]*MapInfo.totalsize() + MapInfo.xshift1(), locate[1]*MapInfo.totalsize() + MapInfo.yshift1(), 0);
        let sprite = node.addComponent(Sprite);

        switch(id) {
            case 1 : {
                matrix1[locate[0]*15 + locate[1]].id = 10;
                resources.load('stables/chuansong/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                    sprite.spriteFrame = spriteFrame;
                });
                break;
            }
            case 2 : {
                matrix1[locate[0]*15 + locate[1]].id = 13;
                resources.load('stables/xuanzhuan_shun/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                    sprite.spriteFrame = spriteFrame;
                });
                break;
            }
            case 3 : {
                matrix1[locate[0]*15 + locate[1]].id = 14;
                resources.load('stables/xuanzhuan_ni/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                    sprite.spriteFrame = spriteFrame;
                });
                break;
            }
            case 4 : {
                matrix1[locate[0]*15 + locate[1]].id = 102;
                resources.load('stables/obstacle/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                    sprite.spriteFrame = spriteFrame;
                });
                break;
            }
            default: break;
        }

        this.obj_array.push(node);
    }

    decodeLevelCode(str: string) {
        enum DecodeMode {
            lightsource,
            flower,
            mirror,
            guangshan,
            stable,
        }
        var Char2NumX = function(i: number) {
            if(i <= 57) return i - 48;
            else return i - 87;
        };
        var Char2NumY = function(i: number) {
            return i - 102;
        };
        let mode : DecodeMode = DecodeMode.lightsource;
        let color : boolean[] = [false, false, false];
        let locate : number[] = [0, 0];
        let dir : number = 0;
        let id : number = 0;
        for (let i=0; i<str.length; ) {
            if (str.charCodeAt(i) >= 65 && str.charCodeAt(i) <= 86) {
                if (str.charCodeAt(i) >= 65 && str.charCodeAt(i) <= 72) { // A-H
                    mode = DecodeMode.lightsource;
                    color[0] = (((str.charCodeAt(i) - 65) & 4) != 0) ? true : false;
                    color[1] = (((str.charCodeAt(i) - 65) & 2) != 0) ? true : false;
                    color[2] = (((str.charCodeAt(i) - 65) & 1) != 0) ? true : false;
                } else if (str.charCodeAt(i) >= 73 && str.charCodeAt(i) <= 80) { // I-P
                    mode = DecodeMode.flower;
                    color[0] = (((str.charCodeAt(i) - 73) & 4) != 0) ? true : false;
                    color[1] = (((str.charCodeAt(i) - 73) & 2) != 0) ? true : false;
                    color[2] = (((str.charCodeAt(i) - 73) & 1) != 0) ? true : false;
                } else if (str.charCodeAt(i) == 81) { // Q
                    mode = DecodeMode.mirror;
                } else if (str.charCodeAt(i) == 82) { // R
                    mode = DecodeMode.guangshan;
                } else if (str.charCodeAt(i) >= 83 && str.charCodeAt(i) <= 86) { // T-V
                    mode = DecodeMode.stable;
                    id = str.charCodeAt(i)- 82;
                } 
                i++;
                continue;
            }

            if (mode == DecodeMode.mirror) {
                let id_arr : number[] = new Array(20);
                let num_arr : number[] = new Array(20);
                let index = 0;
                while (i<str.length && !(str.charCodeAt(i) >= 65 && str.charCodeAt(i) <= 86)) {
                    id_arr[index] = Char2NumX(str.charCodeAt(i)); 
                    num_arr[index] = Char2NumX(str.charCodeAt(i+1)); 
                    index++;
                    i = i + 2;
                }
                this.setMirror(id_arr, num_arr);
            } 
            else if (mode == DecodeMode.lightsource || mode == DecodeMode.guangshan) {
                while (i<str.length && !(str.charCodeAt(i) >= 65 && str.charCodeAt(i) <= 86)) {
                    locate[0] = Char2NumX(str.charCodeAt(i));
                    i++;
                    while (i<str.length && str.charCodeAt(i) >= 102 && str.charCodeAt(i) <= 116) {
                        locate[1] = Char2NumY(str.charCodeAt(i));
                        dir = Char2NumX(str.charCodeAt(i+1));
                        if (mode == DecodeMode.lightsource) {
                            this.setLight(locate, color, dir);

                        } else {
                            this.setGuangshan(locate, dir);
                        }
                        i = i + 2;
                    }
                }
            }
            else if (mode == DecodeMode.flower || mode == DecodeMode.stable) {
                while (i<str.length && !(str.charCodeAt(i)>= 65 && str.charCodeAt(i)<= 86)) {
                    locate[0] = Char2NumX(str.charCodeAt(i));
                    i++;
                    locate[1] = Char2NumY(str.charCodeAt(i));
                    let start_y : number = locate[1];
                    while (i<str.length && ((str.charCodeAt(i)>= 102 && str.charCodeAt(i)<= 116) || str.charCodeAt(i) == 45)) {
                        if (str.charCodeAt(i) >= 102 && str.charCodeAt(i) <= 116) {
                            locate[1] = Char2NumY(str.charCodeAt(i));
                            start_y = locate[1];
                            if (mode == DecodeMode.flower) {
                                this.setFlower(locate, color);
                            } else if (mode == DecodeMode.stable) {
                                this.setStable(locate, id);
                            }
                            i++;
                        }
                        else if (str.charCodeAt(i) == 45) { // '-'
                            let end_y = Char2NumY(str.charCodeAt(i + 1));
                            for (locate[1] = start_y + 1; locate[1] <= end_y; locate[1]++) {
                                if (mode == DecodeMode.flower) {
                                    this.setFlower(locate, color);
                                } else if (mode == DecodeMode.stable) {
                                    this.setStable(locate, id);
                                }
                            }
                            i = i + 2;
                        }
                    }
                }
            }
        }
    }

    setLevel() {
        let name = this.node.getChildByName('LevelName');
        let label = name.getComponent(Label);
        if(this.level_name != null) label.string = (this.level_index + 1) + ' ' + this.level_name;
        else label.string = String(this.level_index + 1);

        if(this.level_difficulty > 0) {
            let diff = this.node.getChildByName('LevelDifficulty');
            let sprite = diff.getComponent(Sprite);
            let path = 'stars/star' + this.level_difficulty + '/spriteFrame';
            resources.load(path, SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                sprite.spriteFrame = spriteFrame;
            });
        }

        let pre_level = this.node.getChildByName('PrevLevel').getComponent(Button);
        if(this.level_index == 0) pre_level.interactable = false;
        else pre_level.interactable = true;

        let next_level = this.node.getChildByName('NextLevel').getComponent(Button);
        if(this.level_index == this.tot_level_num - 1) next_level.interactable = false;
        else next_level.interactable = true;

        this.rotate_form = true;
        let rotate_label = this.node.getChildByName('Rotate').getChildByName('Label').getComponent(Label);
        rotate_label.string = '逆时针';

        if(this.level_code == null || this.level_code.length == 0) return false;
        this.decodeLevelCode(this.level_code);
        return true;
    }

    setUserState(success: boolean) {
        let LevelState = JSON.parse(sys.localStorage.getItem('LevelState'));
        let label = this.node.getChildByName('UserState').getComponent(Label);

        if(success) {
            label.string = '过关！';
            if(!LevelState[this.level_index]) {
                LevelState[this.level_index] = true;
                sys.localStorage.setItem('LevelState', JSON.stringify(LevelState));
            }
        }
        else {
            if(LevelState[this.level_index]) {
                label.string = '已过关';
            }
            else {
                label.string = '未过关';
            }
        }
    }

    success() {
        let success:boolean = true;
        let i:number;
        for(i=0; i<this.flower_array.length; i++) {
            let flower = this.flower_array[i].getComponent(Flower);
            success &&= flower.state;
        }

        let discribe = this.node.getChildByName('LevelDescribe');
        let label = discribe.getComponent(Label);

        if(success) {
            if(this.success_str != null) label.string = '        过关！' + this.success_str;
            else label.string = '';
            this.setUserState(true);
        }
        else {
            if(this.describe_str != null) label.string = '        ' + this.describe_str;
            else label.string = '';
            this.setUserState(false);
        }
    }

    drawLight() {
        for(let i=0; i<this.LP_array.length; i++) {
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

    changeMirror() {
        let i:number, j:number;
        for(i=0; i<15*15; i++) {
            for(j=0; j<8*9; j++) {
                matrix1[i].lightdir[j] = false;
            }
        }
    
        let L_array = new Array<LightSource>(this.LS_array.length);
        for(let i=0; i<L_array.length; i++) {
            let LS = this.LS_array[i];
            L_array[i] = new LightSource(LS.locate, LS.dir, LS.color);
        }
        LightTravel(L_array);
        this.drawLight();
    
        for(i=0; i<this.flower_array.length; i++) {
            let flower = this.flower_array[i].getComponent(Flower);
            flower.ChangeState();
        }
        this.success();
    }

    prevLevel() {
        CurrentLevel[0]--;
        this.level_index--;
        this.level_name = Name[this.level_index];
        this.level_code = Level[this.level_index];
        this.level_difficulty = Diff[this.level_index];
        this.describe_str = Des[this.level_index];
        this.success_str = Suc[this.level_index];

        this.destroyLevel();
        this.level_flag = this.setLevel();
        this.start();
    }

    nextLevel() {
        CurrentLevel[0]++;
        this.level_index++;
        this.level_name = Name[this.level_index];
        this.level_code = Level[this.level_index];
        this.level_difficulty = Diff[this.level_index];
        this.describe_str = Des[this.level_index];
        this.success_str = Suc[this.level_index];

        this.destroyLevel();
        this.level_flag = this.setLevel();
        this.start();
    }

    async reset() {
        if(!this.level_flag) return;
        let confirm = await showUserConfirm('确定重置关卡？');
        if (!confirm) {
            return;
        }

        let level_name = 'Level' + (this.level_index + 1);
        let MS_array = JSON.parse(sys.localStorage.getItem(level_name));
        let mirror: Mirror;
        for(let i=0; i<MS_array.length; i++) {
            MS_array[i].dir = 0;
            MS_array[i].area = 2;
            MS_array[i].locate = generateLocate(i);
            mirror = this.mirror_array[i].getComponent(Mirror);
            if(mirror.area == 1) {
                matrix1[mirror.squarex*15 + mirror.squarey].id = -1;
            }
            mirror.SetMirror(MS_array[i]);
        }

        for(let i=0; i<12*2; i++) {
            let [x, y] = generateLocate(i);
            if(i < MS_array.length) matrix2[x*2 + y] = true;
            else matrix2[x*2 + y] = false;
        }

        this.changeMirror();
        sys.localStorage.setItem(level_name, JSON.stringify(MS_array));
    }

    selectLevel() {
        if(this.level_index < 25) director.loadScene('LevelSelect1');
        else if(this.level_index < 50) director.loadScene('LevelSelect2');
        else if(this.level_index < 75) director.loadScene('LevelSelect3');
        else director.loadScene('LevelSelect4');
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

    destroyLevel() {
        while(this.obj_array.length > 0) {
            let node = this.obj_array.pop();
            node.removeFromParent();
            node.destroy();
        }
        while(this.flower_array.length > 0) {
            let node = this.flower_array.pop();
            node.removeFromParent();
            node.destroy();
        }
        while(this.mirror_array.length > 0) {
            let node = this.mirror_array.pop();
            node.removeFromParent();
            node.destroy();
        }
        while(this.LS_array.length > 0) this.LS_array.pop();

        ClearMatrix();
    }

    getChildrenNum(): number {
        return this.children_num;
    }

    updateMirrorJson(node: Node) {
        let level_name = 'Level' + (this.level_index + 1);
        let index = this.mirror_array.findIndex(arrayNode => arrayNode.uuid === node.uuid);
        let mirror = this.mirror_array[index].getComponent(Mirror);

        let MS_array = JSON.parse(sys.localStorage.getItem(level_name));
        MS_array[index].dir = mirror.dir;
        MS_array[index].area = mirror.area;
        MS_array[index].locate = [mirror.squarex, mirror.squarey];
        sys.localStorage.setItem(level_name, JSON.stringify(MS_array));
    }
}
