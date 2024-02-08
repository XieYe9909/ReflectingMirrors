
import { _decorator, Component, Node, Sprite, SpriteFrame, Color, Button, Label, sys, resources, director } from 'cc';
import { CurrentTotalLevel, Level, Name, Diff, Des, Suc } from './LevelData';
import { CurrentLevel } from './FirstPage';
import { LightPiece } from './LightPiece';
import { LightSource, LightTravel } from './LightTravel';
import { ClearMatrix, matrix1, matrix2, GetColor } from './Square';
import { MirrorState, Mirror } from './Mirror';
import { MapInfo } from './MapInfo';
import { Flower } from './Flower';
const { ccclass } = _decorator;

function Char2Num(str: string): number {
    if(isNaN(Number(str))) return str.charCodeAt(0) - 87;
    else return Number(str);
}

export function Num2Color(num: Number): boolean[] {
    switch (num) {
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

function GenerateLocate(i: number): number[] {
    let x:number, y:number;
    if(i < 12) {
        x = i;
        y = 1;
    }
    else {
        x = i - 12;
        y = 0;
    }
    return [x, y];
}

@ccclass('MainTheme')
export class MainTheme extends Component {
    level_index = CurrentLevel[0] - 1;
    level_flag: boolean;
    level_name = Name[this.level_index];
    level_difficulty = Diff[this.level_index];
    describe_str = Des[this.level_index];
    success_str = Suc[this.level_index];

    rotate_form: boolean;
    success: boolean;
    flower_array = new Array<Node>();
    mirror_array = new Array<Node>();
    obj_array = new Array<Node>();
    LP_array = new Array<Node>();
    LS_array = new Array<LightSource>();
    children_num:number;

    onLoad() {
        ClearMatrix();
        
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

        this.level_flag = this.SetLevel();
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
        this.DrawLight();
        
        for(let i=0; i<this.flower_array.length; i++) {
            let flower = this.flower_array[i].getComponent(Flower);
            flower.ChangeState();
        }
        this.Success();
    }

    SetLight(light_str: string) {
        let light_num = light_str.length / 4;
        for(let i=0; i<light_num; i++) {
            let str = light_str.slice(4*i, 4*(i + 1));
            let locate = [Char2Num(str[0]), Char2Num(str[1])];
            let dir = Char2Num(str[2]);
            let color = Char2Color(str[3]);
            let color_name = Char2ColorName(str[3]);

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
    }

    SetFlower(flower_str: string) {
        let flower_num = flower_str.length / 3;
        for(let i=0; i<flower_num; i++) {
            let str = flower_str.slice(3*i, 3*(i + 1));
            let locate = [Char2Num(str[0]), Char2Num(str[1])];
            let color = Char2Color(str[2]);

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
            flower.locate = locate;
            flower.color = color;
            flower.ChangeState();

            this.flower_array.push(node);
        }
    }

    SetMirror(mirror_str: string) {
        let type_num = mirror_str.length / 2;
        for(let i=0; i<type_num; i++) {
            let str = mirror_str.slice(2*i, 2*(i + 1));
            let id = Char2Num(str[0]);
            let num = Char2Num(str[1]);
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

        let level_name = 'Level' + (this.level_index + 1);
        let MS_str = sys.localStorage.getItem(level_name);
        let MS_array: MirrorState[];
        
        if(MS_str == null || MS_str.length == 0) {
            MS_array = new Array<MirrorState>();
            for(let i=0; i<this.mirror_array.length; i++) {
                let mirror_state = new MirrorState(0, 2, GenerateLocate(i));
                MS_array.push(mirror_state);
            }
            sys.localStorage.setItem(level_name, JSON.stringify(MS_array));
        }
        else {
            MS_array = JSON.parse(MS_str);
            if(MS_array.length != this.mirror_array.length) {
                while(MS_array.length>0) MS_array.pop();
                for(let i=0; i<this.mirror_array.length; i++) {
                    let mirror_state = new MirrorState(0, 2, GenerateLocate(i));
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

    SetGuangshan(guangshan_str: string) {
        let guangshan_num = guangshan_str.length / 3;
        for(let i=0; i<guangshan_num; i++) {
            let str = guangshan_str.slice(3*i, 3*(i + 1));
            let locate = [Char2Num(str[0]), Char2Num(str[1])];
            let dir = Char2Num(str[2]);

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
    }

    SetStable(stable_str: string) {
        let stable_num = stable_str.length / 3;
        for(let i=0; i<stable_num; i++) {
            let str = stable_str.slice(3*i, 3*(i + 1));
            let locate = [Char2Num(str[0]), Char2Num(str[1])];
            let type = str[2];

            let node = new Node('stable');
            this.node.addChild(node);
            node.layer = 33554432;
            node.setPosition(locate[0]*MapInfo.totalsize() + MapInfo.xshift1(), locate[1]*MapInfo.totalsize() + MapInfo.yshift1(), 0);
            let sprite = node.addComponent(Sprite);

            switch(type) {
                case '1': {
                    matrix1[locate[0]*15 + locate[1]].id = 102;
                    resources.load('stables/obstacle/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                        sprite.spriteFrame = spriteFrame;
                    });
                    break;
                }
                case '2': {
                    matrix1[locate[0]*15 + locate[1]].id = 10;
                    resources.load('stables/chuansong/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                        sprite.spriteFrame = spriteFrame;
                    });
                    break;
                }
                case '3': {
                    matrix1[locate[0]*15 + locate[1]].id = 13;
                    resources.load('stables/xuanzhuan_shun/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                        sprite.spriteFrame = spriteFrame;
                    });
                    break;
                }
                case '4': {
                    matrix1[locate[0]*15 + locate[1]].id = 14;
                    resources.load('stables/xuanzhuan_ni/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
                        sprite.spriteFrame = spriteFrame;
                    });
                    break;
                }
                default: break;
            }

            this.obj_array.push(node);
        }
    }

    SetLevel() {
        let name = this.node.getChildByName('LevelName');
        let label = name.getComponent(Label);
        if(this.level_name != null) label.string = (this.level_index + 1) + ' ' + this.level_name;
        else label.string = String(this.level_index + 1);

        let diff = this.node.getChildByName('LevelDifficulty');
        if(this.level_difficulty > 0) {
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
        if(this.level_index == CurrentTotalLevel - 1) next_level.interactable = false;
        else next_level.interactable = true;

        this.rotate_form = true;
        let rotate_label = this.node.getChildByName('Rotate').getChildByName('Label').getComponent(Label);
        rotate_label.string = '逆时针';

        let level_str = Level[this.level_index];
        if(level_str == null || level_str.length == 0) return false;

        let LFMGS = [-1, -1, -1, -1, -1];
        for(let i=0; i<level_str.length; i++) {
            switch(level_str[i]) {
                case 'L': LFMGS[0] = i; break;
                case 'F': LFMGS[1] = i; break;
                case 'M': LFMGS[2] = i; break;
                case 'G': LFMGS[3] = i; break;
                case 'S': LFMGS[4] = i; break;
                default: break;
            }
        }
        if(LFMGS[0]<0 || LFMGS[1]<0 || LFMGS[2]<0) return false;

        let light_str = level_str.slice(LFMGS[0] + 1, LFMGS[1]);
        let flower_str = level_str.slice(LFMGS[1] + 1, LFMGS[2]);
        let mirror_str: string = null;
        let guangshan_str: string = null;
        let stable_str:string = null;
        if(LFMGS[3] >= 0) {
            mirror_str = level_str.slice(LFMGS[2] + 1, LFMGS[3]);
            if(LFMGS[4] >= 0) {
                guangshan_str = level_str.slice(LFMGS[3] + 1, LFMGS[4]);
                stable_str = level_str.slice(LFMGS[4] + 1, level_str.length);
            }
            else guangshan_str = level_str.slice(LFMGS[3] + 1, level_str.length);
        }
        else {
            if(LFMGS[4] >= 0) {
                mirror_str = level_str.slice(LFMGS[2] + 1, LFMGS[4]);
                stable_str = level_str.slice(LFMGS[4] + 1, level_str.length);
            }
            else mirror_str = level_str.slice(LFMGS[2] + 1, level_str.length);
        }

        this.SetLight(light_str);
        this.SetFlower(flower_str);
        if(guangshan_str != null) this.SetGuangshan(guangshan_str);
        if(stable_str != null) this.SetStable(stable_str);
        this.SetMirror(mirror_str);
        return true;
    }

    SetUserState(success:boolean) {
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

    Success() {
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
            this.SetUserState(true);
        }
        else {
            if(this.describe_str != null) label.string = '        ' + this.describe_str;
            else label.string = '';
            this.SetUserState(false);
        }
    }

    DrawLight() {
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

    ChangeMirror() {
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
        this.DrawLight();
    
        for(i=0; i<this.flower_array.length; i++) {
            let flower = this.flower_array[i].getComponent(Flower);
            flower.ChangeState();
        }
        this.Success();
    }

    PrevLevel() {
        CurrentLevel[0]--;
        this.level_index--;
        this.level_name = Name[this.level_index];
        this.level_difficulty = Diff[this.level_index];
        this.describe_str = Des[this.level_index];
        this.success_str = Suc[this.level_index];

        this.DestroyLevel();
        this.level_flag = this.SetLevel();
        this.start();
    }

    NextLevel() {
        CurrentLevel[0]++;
        this.level_index++;
        this.level_name = Name[this.level_index];
        this.level_difficulty = Diff[this.level_index];
        this.describe_str = Des[this.level_index];
        this.success_str = Suc[this.level_index];

        this.DestroyLevel();
        this.level_flag = this.SetLevel();
        this.start();
    }

    Reset() {
        if(!this.level_flag) return;

        let level_name = 'Level' + (this.level_index + 1);
        let MS_array = JSON.parse(sys.localStorage.getItem(level_name));
        let mirror: Mirror;
        for(let i=0; i<MS_array.length; i++) {
            MS_array[i].dir = 0;
            MS_array[i].area = 2;
            MS_array[i].locate = GenerateLocate(i);
            mirror = this.mirror_array[i].getComponent(Mirror);
            if(mirror.area == 1) {
                matrix1[mirror.squarex*15 + mirror.squarey].id = -1;
            }
            mirror.SetMirror(MS_array[i]);
        }

        for(let i=0; i<12*2; i++) {
            let [x, y] = GenerateLocate(i);
            if(i < MS_array.length) matrix2[x*2 + y] = true;
            else matrix2[x*2 + y] = false;
        }

        this.ChangeMirror();
        sys.localStorage.setItem(level_name, JSON.stringify(MS_array));
    }

    SelectLevel() {
        if(this.level_index < 25) director.loadScene('LevelSelect1');
        else if(this.level_index < 50) director.loadScene('LevelSelect2');
        else if(this.level_index < 75) director.loadScene('LevelSelect3');
        else director.loadScene('LevelSelect4');
    }

    SetRotate() {
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

    DestroyLevel() {
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
}
