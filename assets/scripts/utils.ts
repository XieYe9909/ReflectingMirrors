import { Node } from "cc";

export function getIndexByID(targetNode: Node, array: Node[]): number {
    return array.findIndex(arrayNode => arrayNode.uuid === targetNode.uuid);
}
