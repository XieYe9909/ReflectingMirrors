import { Node } from "cc";

export function getIndexByID(targetNode: Node, array: Node[]): number {
    return array.findIndex(arrayNode => arrayNode.uuid === targetNode.uuid);
}

export function generateLocate(i: number): number[] {
    let x: number, y: number;
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
