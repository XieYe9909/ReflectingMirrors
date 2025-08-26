import { sys } from 'cc';
import { MirrorState } from './Mirror';
import { generateLocate } from './utils';

const MAX_SAVED_LEVEL = 25;

export class LevelInfo {
    index: number = 0;
    name: string;
    code: string;
    MS_array: MirrorState[];
    isPassed: boolean;

    constructor(name: string, code: string, mirror_num: number, isPassed: boolean) {
        this.name = name;
        this.code = code;
        this.isPassed = isPassed;

        this.MS_array = new Array<MirrorState>(mirror_num);
        for (let i = 0; i < mirror_num; i++) {
            this.MS_array[i] = new MirrorState(0, 2, generateLocate(i));
        }
    }
}

export function SaveLevel(name: string, code: string, mirror_num: number, isPassed: boolean): boolean {
    let new_info = new LevelInfo(name, code, mirror_num, isPassed);
    let data = sys.localStorage.getItem('CustomedLevelData');
    let level_info_array = data ? JSON.parse(data) : [];

    if (level_info_array == null || level_info_array.length == 0) {
        sys.localStorage.setItem('CustomedLevelData', JSON.stringify([new_info]));
        return true;
    }
    else if (level_info_array.length >= MAX_SAVED_LEVEL) {
        return false;
    }
    else {
        new_info.index = level_info_array.length;

        level_info_array.push(new_info);
        sys.localStorage.setItem('CustomedLevelData', JSON.stringify(level_info_array));
        return true;
    }
}

export function DeleteLevel(index: number) {
    let data = sys.localStorage.getItem('CustomedLevelData');
    let level_info_array = data ? JSON.parse(data) : [];

    if (level_info_array == null || level_info_array.length == 0) {
        return;
    }
    else {
        level_info_array.splice(index, 1);
        let new_length = level_info_array.length;
        for (let i = index; i < new_length; i++) {
            level_info_array[i].index = i;
        }
        sys.localStorage.setItem('CustomedLevelData', JSON.stringify(level_info_array));
    }
}