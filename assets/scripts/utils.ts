import { Node } from "cc";

export function getIndexByID(node: Node, array: Node[]): number {
    let len = array.length;
    for (let i = 0; i < len; i++) {
        if (!node.uuid.localeCompare(array[i].uuid)) {
            return i;
        }
    }
    return null;
}
