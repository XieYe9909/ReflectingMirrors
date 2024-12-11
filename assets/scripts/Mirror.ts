
import { _decorator, Node, EventTouch, Component, sys } from 'cc';
import { MapInfo } from './MapInfo';
import { matrix1, matrix2 } from './Square';
import { MainTheme } from './MainTheme';
import { getIndexByID } from './utils';
const { ccclass } = _decorator;

export class MirrorState {
    public dir:number;
    public area:number;
    public locate:number[];

    constructor(dir:number, area:number, locate:number[]) {
        this.dir = dir;
        this.area = area;
        this.locate = locate;
    }
}

@ccclass('Mirror')
export class Mirror extends Component {
    id = 0;
    rotatable = true;
    rotate_form: boolean;
    dir: number;
    area: number;
    squarex: number;
    squarey: number;
    isClick = true;
    main_theme: MainTheme;

    onLoad() {
        let main_theme = this.node.parent.getComponent(MainTheme);
        this.main_theme = main_theme;
    }

    start () {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
    }

    /**
     * Instead by getIndexByID
     */
    // GetMirrorIndex(): number {
    //     let mirror_num = this.main_theme.mirror_array.length;
    //     for(let i=0; i<mirror_num; i++) {
    //         if(!this.node.uuid.localeCompare(this.main_theme.mirror_array[i].uuid)) return i;
    //     }
    //     return null;
    // }

    SetMirror(mirror_state:MirrorState) {
        this.dir = mirror_state.dir
        this.area = mirror_state.area;
        this.squarex = mirror_state.locate[0];
        this.squarey = mirror_state.locate[1];

        if(this.area == 1){
            this.node.setPosition(this.squarex*MapInfo.totalsize() + MapInfo.xshift1(), this.squarey*MapInfo.totalsize() + MapInfo.yshift1(), 0);
            if(this.rotatable) this.node.setRotationFromEuler(0, 0, this.dir*45);
            if(this.squarex*15 + this.squarey < 15*15){
                matrix1[this.squarex*15 + this.squarey].id = this.id;
                matrix1[this.squarex*15 + this.squarey].mirrordir = this.dir;
            }
        }
        else if(this.area == 2) {
            this.node.setPosition(this.squarex*MapInfo.totalsize2x() + MapInfo.xshift2(), this.squarey*MapInfo.totalsize2y() + MapInfo.yshift2(), 0);
            if(this.rotatable) this.node.setRotationFromEuler(0, 0, this.dir*45);
            if(this.squarex*2 + this.squarey < 2*12){
                matrix2[this.squarex*2 + this.squarey] = true;
            }
        }
    }

    ChangeMirrorState(index:number) {
        let level_name = 'Level' + (this.main_theme.level_index + 1);

        let MS_array = JSON.parse(sys.localStorage.getItem(level_name));
        MS_array[index].dir = this.dir;
        MS_array[index].area = this.area;
        MS_array[index].locate = [this.squarex, this.squarey];
        sys.localStorage.setItem(level_name, JSON.stringify(MS_array));
    }

    touchStart (event:EventTouch) {
        this.isClick = true;
        this.node.setSiblingIndex(this.main_theme.children_num - 1);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.scheduleOnce(function(){
            this.isClick = false;
        }, 0.1)
    }

    touchEnd (event:EventTouch) {
        let index = getIndexByID(this.node, this.main_theme.mirror_array);
        if(this.isClick){
            if(this.rotatable){
                if(this.main_theme.rotate_form) this.dir = (this.dir + 1) % 8;
                else this.dir = (this.dir + 7) % 8;
                this.node.setRotationFromEuler(0, 0, this.dir * 45);
                this.ChangeMirrorState(index);
            }
            if(this.area == 1){
                if((this.id>2 && this.id<9) || this.id>14) this.node.setSiblingIndex(0);
                this.node.setPosition(this.squarex*MapInfo.totalsize() + MapInfo.xshift1(), this.squarey*MapInfo.totalsize() + MapInfo.yshift1(), 0);
                matrix1[this.squarex*15 + this.squarey].mirrordir = this.dir;
                this.main_theme.ChangeMirror();
            }
            else{
                this.node.setPosition(this.squarex*MapInfo.totalsize2x() + MapInfo.xshift2(), this.squarey*MapInfo.totalsize2y() + MapInfo.yshift2(), 0);
            }
        }
        else{
            let x:number = event.getUILocation().x - 562.5;
            let y:number = event.getUILocation().y - 1218;
            let new_x:number;
            let new_y:number;
            if(x>=MapInfo.xstart1() && x<=MapInfo.xend1() && y>=MapInfo.ystart1() && y<=MapInfo.yend1()){
                new_x = Math.floor((x - MapInfo.xstart1())/MapInfo.totalsize());
                new_y = Math.floor((y - MapInfo.ystart1())/MapInfo.totalsize());
                if(matrix1[new_x*15 + new_y].id == -1){
                    if(this.area == 1){
                        matrix1[this.squarex*15 + this.squarey].id = -1;
                    }
                    else{
                        matrix2[this.squarex*2 + this.squarey] = false;
                        this.area = 1;
                    }
                    matrix1[new_x*15 + new_y].id = this.id;
                    matrix1[new_x*15 + new_y].mirrordir = this.dir;
                    this.squarex = new_x;
                    this.squarey = new_y;

                    if((this.id>2 && this.id<9) || this.id>14) this.node.setSiblingIndex(0);
                    this.node.setPosition(this.squarex*MapInfo.totalsize() + MapInfo.xshift1(), this.squarey*MapInfo.totalsize() + MapInfo.yshift1(), 0);
                    this.main_theme.ChangeMirror();
                    this.ChangeMirrorState(index);
                }
                else{
                    if(this.area == 1){
                        if((this.id>2 && this.id<9) || this.id>14) this.node.setSiblingIndex(0);
                        this.node.setPosition(this.squarex*MapInfo.totalsize() + MapInfo.xshift1(), this.squarey*MapInfo.totalsize() + MapInfo.yshift1(), 0);
                    }
                    else{
                        this.node.setPosition(this.squarex*MapInfo.totalsize2x() + MapInfo.xshift2(), this.squarey*MapInfo.totalsize2y() + MapInfo.yshift2(), 0);
                    }
                }
            }
            else if(x>=MapInfo.xstart2() && x<=MapInfo.xend2() && y>=MapInfo.ystart2() && y<=MapInfo.yend2()){
                new_x = Math.floor((x - MapInfo.xstart2())/MapInfo.totalsize2x());
                new_y = Math.floor((y - MapInfo.ystart2())/MapInfo.totalsize2y());
                if(matrix2[new_x*2 + new_y] == false){
                    if(this.area == 1){
                        matrix1[this.squarex*15 + this.squarey].id = -1;
                        this.main_theme.ChangeMirror();
                    }
                    else{
                        matrix2[this.squarex*2 + this.squarey] = false;
                    }
                    this.area = 2;
                    matrix2[new_x*2 + new_y] = true;
                    this.squarex = new_x;
                    this.squarey = new_y;
                    this.node.setPosition(this.squarex*MapInfo.totalsize2x() + MapInfo.xshift2(), this.squarey*MapInfo.totalsize2y() + MapInfo.yshift2(), 0);
                    this.ChangeMirrorState(index);
                }
                else{
                    if(this.area == 1){
                        if((this.id>2 && this.id<9) || this.id>14) this.node.setSiblingIndex(0);
                        this.node.setPosition(this.squarex*MapInfo.totalsize() + MapInfo.xshift1(), this.squarey*MapInfo.totalsize() + MapInfo.yshift1(), 0);
                    }
                    else{
                        this.node.setPosition(this.squarex*MapInfo.totalsize2x() + MapInfo.xshift2(), this.squarey*MapInfo.totalsize2y() + MapInfo.yshift2(), 0);
                    }
                }
            }
            else{
                if(this.area == 1){
                    this.node.setPosition(this.squarex*MapInfo.totalsize() + MapInfo.xshift1(), this.squarey*MapInfo.totalsize() + MapInfo.yshift1(), 0);
                }
                else{
                    this.node.setPosition(this.squarex*MapInfo.totalsize2x() + MapInfo.xshift2(), this.squarey*MapInfo.totalsize2y() + MapInfo.yshift2(), 0);
                }
            }
        }
    }

    touchMove (event:EventTouch) {
        this.node.setPosition(this.node.getPosition().x + event.getUIDelta().x, this.node.getPosition().y + event.getUIDelta().y, 0);
    }
}
