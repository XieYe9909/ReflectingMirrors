import { _decorator, Node } from 'cc';

export interface MainThemeInterface {
    changeMirror(): void;
    updateMirrorJson(node: Node): void;
    getChildrenNum(): number;
    
    rotate_form: boolean;
}