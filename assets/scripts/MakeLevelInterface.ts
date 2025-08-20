import { _decorator, Node } from 'cc';

export type Mode = 'add' | 'delete' | 'none';

export interface MakeLevelInterface {
    prefab_array : Array<Node>;
    frame_array : Array<Node>;
    LP_array : Array<Node>;

    light_array : Array<Node>;
    flower_array : Array<Node>;
    mirror_array : Array<Node>;
    stable_array : Array<Node>;

    prefab_num : number;
    active_index : number;
    mode: Mode;
    rotate_form: boolean;
    fixed_obj_num: number;
    window: Node;
    moved: boolean;

    node: Node;

    run() : void;
    success() : void;
}