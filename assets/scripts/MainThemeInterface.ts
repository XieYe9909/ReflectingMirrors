import { _decorator, Node } from 'cc';

export interface MainThemeInterface {
    ChangeMirror() : void;
    UpdateMirrorJson(node:Node) : void;
    GetChildrenNum() : number;
    
    rotate_form: boolean;
}