
import { matrix1, GetInColor, AddColor, AddQuantumColor } from "./Square";

export class LightSource {
    locate:number[] = new Array(2);
    dir:number;
    color:boolean[] = new Array(3);

    constructor(locate: number[], dir: number, color:boolean[]){
        this.locate[0] = locate[0];
        this.locate[1] = locate[1];
        this.dir = dir;
        this.color[0] = color[0];
        this.color[1] = color[1];
        this.color[2] = color[2];
    }
}

export function GetDiffDir(dir1:number, dir2:number) {
    let diff = dir1 - dir2;
    return diff >= 0 ? diff : (8 + diff);
}

function GetStep(dir:number):number[] {
    dir = dir % 8;
    switch(dir) {
        case 0: return [1, 0];
        case 1: return [1, 1];
        case 2: return [0, 1];
        case 3: return [-1, 1];
        case 4: return [-1, 0];
        case 5: return [-1, -1];
        case 6: return [0, -1];
        case 7: return [1, -1];
    }
}

function QuantumNewLS(LS:LightSource, LS_array:LightSource[]) {
    let loc = LS.locate;
    let l_dir = LS.dir;
    let color = LS.color
    let id = matrix1[loc[0]*15 + loc[1]].id;
    let m_dir = matrix1[loc[0]*15 + loc[1]].mirrordir;
    let diff = GetDiffDir(m_dir, l_dir)
    switch(id) {
        case -1:
        case 0: {
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            return LS;
        }
        case 1: {
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 3: {
                    let nLS = new LightSource(loc, (l_dir + 2) % 8, color);
                    return nLS;
                }
                case 4: {
                    let nLS = new LightSource(loc, (l_dir + 4) % 8, color);
                    return nLS;
                }
                case 5: {
                    let nLS = new LightSource(loc, (l_dir + 6) % 8, color);
                    return nLS;
                }
                default: return null;
            }
        }
        case 2: { //斜角鏡
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 2: {
                    let nLS = new LightSource(loc, (l_dir + 1) % 8, color);
                    return nLS;
                }
                case 3: {
                    let nLS = new LightSource(loc, (l_dir + 3) % 8, color);
                    return nLS;
                }
                case 4: {
                    let nLS = new LightSource(loc, (l_dir + 5) % 8, color);
                    return nLS;
                }
                case 5: {
                    let nLS = new LightSource(loc, (l_dir + 7) % 8, color);
                    return nLS;
                }
                default: return null;
            }
        }
        case 3: //分光鏡
        case 11: { //量子鏡
            let step = GetStep(l_dir);
            let old_loc = new Array<number>(2);
            old_loc[0] = loc[0] - step[0];
            old_loc[1] = loc[1] - step[1];
            let nLS = new LightSource(old_loc, l_dir, color);
            LS_array.push(nLS);
            return null;
        }
        case 4: { //濾光鏡（紅）
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 0:
                case 4: {
                    if(color[0]) {
                        let nLS = new LightSource(loc, l_dir, [true, false, false]);
                        return nLS;
                    }
                    return null;
                }
                default: return null;
            }
        }
        case 5: { //濾光鏡（綠）
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 0:
                case 4: {
                    if(color[1]) {
                        let nLS = new LightSource(loc, l_dir, [false, true, false]);
                        return nLS;
                    }
                    return null;
                }
                default: return null;
            }
        }
        case 6: { //濾光鏡（藍）
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 0:
                case 4: {
                    if(color[2]) {
                        let nLS = new LightSource(loc, l_dir, [false, false, true]);
                        return nLS;
                    }
                    return null;
                }
                default: return null;
            }
        }
        case 7: { //光柵
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 2:
                case 6: {
                    let nLS = new LightSource(loc, l_dir, color);
                    return nLS;
                }
                default: return null;
            }
        }
        case 8: { //三棱鏡
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 0:
                case 5: {
                    if(color[0]) {
                        let nLS = new LightSource(loc, l_dir, [true, false, false]);
                        return nLS;
                    }
                    return null;
                }
                case 1: {
                    if(color[0]) {
                        let nLS = new LightSource(loc, l_dir, [true, false, false]);
                        return nLS;
                    }
                    else if(color[1]) {
                        let nLS = new LightSource(loc, (l_dir + 7) % 8, [false, true, false]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 6) % 8, [false, false, true]);
                        return nLS;
                    }
                }
                case 4: {
                    if(color[0]) {
                        let nLS = new LightSource(loc, l_dir, [true, false, false]);
                        return nLS;
                    }
                    else if(color[1]) {
                        let nLS = new LightSource(loc, (l_dir + 1) % 8, [false, true, false]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 2) % 8, [false, false, true]);
                        return nLS;
                    }
                }
                case 6: {
                    if(color[1]) {
                        let nLS = new LightSource(loc, (l_dir + 1) % 8, [false, true, false]);
                        return nLS;
                    }
                    if(color[2]) {
                        let nLS = new LightSource(loc, (l_dir + 6) % 8, [false, false, true]);
                        return nLS;
                    }
                    return null;
                }
                case 7: {
                    if(color[1]) {
                        let nLS = new LightSource(loc, (l_dir + 7) % 8, [false, true, false]);
                        return nLS;
                    }
                    if(color[2]) {
                        let nLS = new LightSource(loc, (l_dir + 2) % 8, [false, false, true]);
                        return nLS;
                    }
                    return null;
                }
                default: return null;
            }
        }
        case 9: { //變色鏡
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 2: {
                    let nLS = new LightSource(loc, l_dir, [color[2], color[0], color[1]]);
                    return nLS;
                }
                case 6: {
                    let nLS = new LightSource(loc, l_dir, [color[1], color[2], color[0]]);
                    return nLS;
                }
                default: return null;
            }
        }
        case 10: { //傳送門
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            let step = GetStep(l_dir);
            let new_loc = new Array<number>(2);
            [new_loc[0], new_loc[1]] = loc;

            while(true) {
                new_loc[0] = new_loc[0] + step[0];
                new_loc[1] = new_loc[1] + step[1];

                if((new_loc[0] < 0) || (new_loc[0] >= 15)) return null;
                if((new_loc[1] < 0) || (new_loc[1] >= 15)) return null;

                if(matrix1[new_loc[0]*15 + new_loc[1]].id == 10) {
                    let nLS = new LightSource(new_loc, l_dir, color);
                    return nLS;
                }
            }
        }
        case 13: { //旋轉鏡（順時針）
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            let nLS = new LightSource(loc, (l_dir + 6) % 8, color);
            return nLS;
        }
        case 14: { //旋轉鏡（逆時針）
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            let nLS = new LightSource(loc, (l_dir + 2) % 8, color);
            return nLS;
        }
        case 15: { //擇色鏡（紅）
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 0:
                case 4: {
                    if(color[0]) {
                        let nLS = new LightSource(loc, l_dir, [true, false, false]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 4) % 8, [false, color[1], color[2]]);
                        return nLS;
                    }
                }
                case 1:
                case 5: {
                    if(color[0]) {
                        let nLS = new LightSource(loc, l_dir, [true, false, false]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 6) % 8, [false, color[1], color[2]]);
                        return nLS;
                    }
                }
                case 3:
                case 7: {
                    if(color[0]) {
                        let nLS = new LightSource(loc, l_dir, [true, false, false]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 2) % 8, [false, color[1], color[2]]);
                        return nLS;
                    }
                }
                default: return null;
            }
        }
        case 16: { //擇色鏡（綠）
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 0:
                case 4: {
                    if(color[1]) {
                        let nLS = new LightSource(loc, l_dir, [false, true, false]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 4) % 8, [color[0], false, color[2]]);
                        return nLS;
                    }
                }
                case 1:
                case 5: {
                    if(color[1]) {
                        let nLS = new LightSource(loc, l_dir, [false, true, false]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 6) % 8, [color[0], false, color[2]]);
                        return nLS;
                    }
                }
                case 3:
                case 7: {
                    if(color[1]) {
                        let nLS = new LightSource(loc, l_dir, [false, true, false]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 2) % 8, [color[0], false, color[2]]);
                        return nLS;
                    }
                }
                default: return null;
            }
        }
        case 17: { //擇色鏡（藍）
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 0:
                case 4: {
                    if(color[2]) {
                        let nLS = new LightSource(loc, l_dir, [false, false, true]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 4) % 8, [color[0], color[1], false]);
                        return nLS;
                    }
                }
                case 1:
                case 5: {
                    if(color[2]) {
                        let nLS = new LightSource(loc, l_dir, [false, false, true]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 6) % 8, [color[0], color[1], false]);
                        return nLS;
                    }
                }
                case 3:
                case 7: {
                    if(color[2]) {
                        let nLS = new LightSource(loc, l_dir, [false, false, true]);
                        return nLS;
                    }
                    else {
                        let nLS = new LightSource(loc, (l_dir + 2) % 8, [color[0], color[1], false]);
                        return nLS;
                    }
                }
                default: return null;
            }
        }
        case 18: { //多用濾光鏡
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            switch(diff) {
                case 0:
                case 4: {
                    if(color[1]) {
                        let nLS = new LightSource(loc, l_dir, [false, true, false]);
                        return nLS;
                    }
                    return null;
                }
                case 1:
                case 5: {
                    if(color[2]) {
                        let nLS = new LightSource(loc, l_dir, [false, false, true]);
                        return nLS;
                    }
                    return null;
                }
                case 2:
                case 6: {
                    let nLS = new LightSource(loc, l_dir, color);
                    return nLS;
                }
                case 3:
                case 7: {
                    if(color[0]) {
                        let nLS = new LightSource(loc, l_dir, [true, false, false]);
                        return nLS;
                    }
                    return null;
                }
                default: return null;
            }
        }
        case 101: { //光源
            AddQuantumColor(loc, (l_dir + 4) % 8, color, true);
            return null;
        }
        default: return null;
    }
}

function QuantumLightTravel(LS1:LightSource, LS2:LightSource, LS_array:LightSource[]) {
    if(LS1 == null && LS2 == null) return;
    if(LS1 == null) {
        let step = GetStep(LS2.dir);
        let loc = new Array<number>(2);
        loc[0] = LS2.locate[0] - step[0];
        loc[1] = LS2.locate[1] - step[1];
        let nLS = new LightSource(loc, LS2.dir, LS2.color);
        LS_array.push(nLS);
        return;
    }
    if(LS2 == null) {
        let step = GetStep(LS1.dir);
        let loc = new Array<number>(2);
        loc[0] = LS1.locate[0] - step[0];
        loc[1] = LS1.locate[1] - step[1];
        let nLS = new LightSource(loc, LS1.dir, LS1.color);
        LS_array.push(nLS);
        return;
    }
    let nLS1 = QuantumNewLS(LS1, LS_array);
    let nLS2 = QuantumNewLS(LS2, LS_array);
    
    if(nLS1) {
        let index1 = nLS1.locate[0]*15 + nLS1.locate[1];
        if(nLS2 && matrix1[index1].id == 9) {
            let diff = GetDiffDir(matrix1[index1].mirrordir, nLS1.dir);
            if(diff == 2) {
                nLS2.color = [nLS2.color[1], nLS2.color[2], nLS2.color[0]];
            }
            else {
                nLS2.color = [nLS2.color[2], nLS2.color[0], nLS2.color[1]];
            }
        }
    }
    if(nLS2) {
        let index2 = nLS2.locate[0]*15 + nLS2.locate[1];
        if(nLS1 && matrix1[index2].id == 9) {
            let diff = GetDiffDir(matrix1[index2].mirrordir, nLS2.dir);
            if(diff == 2) {
                nLS1.color = [nLS1.color[1], nLS1.color[2], nLS1.color[0]];
            }
            else {
                nLS1.color = [nLS1.color[2], nLS1.color[0], nLS1.color[1]];
            }
        }
    }
    if(nLS1) {
        AddQuantumColor(nLS1.locate, nLS1.dir, nLS1.color, false);
        let step1 = GetStep(nLS1.dir);
        nLS1.locate[0] = nLS1.locate[0] + step1[0];
        nLS1.locate[1] = nLS1.locate[1] + step1[1];
        if(nLS1.locate[0]<0 || nLS1.locate[0]>=15 || nLS1.locate[1]<0 || nLS1.locate[1]>=15) nLS1 = null;
    }
    if(nLS2) {
        AddQuantumColor(nLS2.locate, nLS2.dir, nLS2.color, false);
        let step2 = GetStep(nLS2.dir);
        nLS2.locate[0] = nLS2.locate[0] + step2[0];
        nLS2.locate[1] = nLS2.locate[1] + step2[1];
        if(nLS2.locate[0]<0 || nLS2.locate[0]>=15 || nLS2.locate[1]<0 || nLS2.locate[1]>=15) nLS2 = null;
    }
    QuantumLightTravel(nLS1, nLS2, LS_array);
}

export function NewLS(id:number, locate:number[], m_dir:number, l_dir:number, color:boolean[], LS_array:LightSource[]) {
    let diff = GetDiffDir(m_dir, l_dir); //注意dir_l為入射光的方向
    switch(id) {
        case 1: { //直角鏡
            switch(diff) {
                case 3: {
                    let LS = new LightSource(locate, (l_dir + 2) % 8, color);
                    LS_array.push(LS);
                    break;
                }
                case 4: {
                    let LS = new LightSource(locate, (l_dir + 4) % 8, color);
                    LS_array.push(LS);
                    break;
                }
                case 5: {
                    let LS = new LightSource(locate, (l_dir + 6) % 8, color);
                    LS_array.push(LS);
                    break;
                }
                default: break;
            }
            break;
        }
        case 2: { //斜角鏡
            switch(diff) {
                case 2: {
                    let LS = new LightSource(locate, (l_dir + 1) % 8, color);
                    LS_array.push(LS);
                    break;
                }
                case 3: {
                    let LS = new LightSource(locate, (l_dir + 3) % 8, color);
                    LS_array.push(LS);
                    break;
                }
                case 4: {
                    let LS = new LightSource(locate, (l_dir + 5) % 8, color);
                    LS_array.push(LS);
                    break;
                }
                case 5: {
                    let LS = new LightSource(locate, (l_dir + 7) % 8, color);
                    LS_array.push(LS);
                    break;
                }
                default: break;
            }
            break;
        }
        case 3: { //分光鏡
            switch(diff) {
                case 0:
                case 4: {
                    let LS1 = new LightSource(locate, l_dir, color);
                    let LS2 = new LightSource(locate, (l_dir + 4) % 8, color);
                    LS_array.push(LS1, LS2);
                    break;
                }
                case 1:
                case 5: {
                    let LS1 = new LightSource(locate, l_dir, color);
                    let LS2 = new LightSource(locate, (l_dir + 6) % 8, color);
                    LS_array.push(LS1, LS2);
                    break;
                }
                case 3:
                case 7: {
                    let LS1 = new LightSource(locate, l_dir, color);
                    let LS2 = new LightSource(locate, (l_dir + 2) % 8, color);
                    LS_array.push(LS1, LS2);
                    break;
                }
                default: break;
            }
            break;
        }
        case 4: { //濾光鏡（紅）
            switch(diff) {
                case 0:
                case 4: {
                    if(color[0]) {
                        let LS = new LightSource(locate, l_dir, [true, false, false]);
                        LS_array.push(LS);
                    }
                    break;
                }
                default: break;
            }
            break;
        }
        case 5: { //濾光鏡（綠）
            switch(diff) {
                case 0:
                case 4: {
                    if(color[1]) {
                        let LS = new LightSource(locate, l_dir, [false, true, false]);
                        LS_array.push(LS);
                    }
                    break;
                }
                default: break;
            }
            break;
        }
        case 6: { //濾光鏡（藍）
            switch(diff) {
                case 0:
                case 4: {
                    if(color[2]) {
                        let LS = new LightSource(locate, l_dir, [false, false, true]);
                        LS_array.push(LS);
                    }
                    break;
                }
                default: break;
            }
            break;
        }
        case 7: { //光柵
            switch(diff) {
                case 2:
                case 6: {
                    let LS = new LightSource(locate, l_dir, color);
                    LS_array.push(LS);
                    break;
                }
                default: break;
            }
            break;
        }
        case 8: { //三棱鏡
            switch(diff) {
                case 0:
                case 5: {
                    if(color[0]) {
                        let LS = new LightSource(locate, l_dir, [true, false, false]);
                        LS_array.push(LS);
                    }
                    break;
                }
                case 1: {
                    if(color[0]) {
                        let LS = new LightSource(locate, l_dir, [true, false, false]);
                        LS_array.push(LS);
                    }
                    if(color[1]) {
                        let LS = new LightSource(locate, (l_dir + 7) % 8, [false, true, false]);
                        LS_array.push(LS);
                    }
                    if(color[2]) {
                        let LS = new LightSource(locate, (l_dir + 6) % 8, [false, false, true]);
                        LS_array.push(LS);
                    }
                    break;
                }
                case 4: {
                    if(color[0]) {
                        let LS = new LightSource(locate, l_dir, [true, false, false]);
                        LS_array.push(LS);
                    }
                    if(color[1]) {
                        let LS = new LightSource(locate, (l_dir + 1) % 8, [false, true, false]);
                        LS_array.push(LS);
                    }
                    if(color[2]) {
                        let LS = new LightSource(locate, (l_dir + 2) % 8, [false, false, true]);
                        LS_array.push(LS);
                    }
                    break;
                }
                case 6: {
                    if(color[1]) {
                        let LS = new LightSource(locate, (l_dir + 1) % 8, [false, true, false]);
                        LS_array.push(LS);
                    }
                    if(color[2]) {
                        let LS = new LightSource(locate, (l_dir + 6) % 8, [false, false, true]);
                        LS_array.push(LS);
                    }
                    break;
                }
                case 7: {
                    if(color[1]) {
                        let LS = new LightSource(locate, (l_dir + 7) % 8, [false, true, false]);
                        LS_array.push(LS);
                    }
                    if(color[2]) {
                        let LS = new LightSource(locate, (l_dir + 2) % 8, [false, false, true]);
                        LS_array.push(LS);
                    }
                    break;
                }
                default: break;
            }
            break;
        }
        case 9: { //變色鏡
            switch(diff) {
                case 2: {
                    let LS = new LightSource(locate, l_dir, [color[2], color[0], color[1]]);
                    LS_array.push(LS);
                    break;
                }
                case 6: {
                    let LS = new LightSource(locate, l_dir, [color[1], color[2], color[0]]);
                    LS_array.push(LS);
                    break;
                }
                default: break;
            }
            break;
        }
        case 10: { //傳送門
            let step = GetStep(l_dir);
            let loc = new Array<number>(2);
            [loc[0], loc[1]] = locate;

            while(true) {
                loc[0] = loc[0] + step[0];
                loc[1] = loc[1] + step[1];

                if((loc[0] < 0) || (loc[0] >= 15)) break;
                if((loc[1] < 0) || (loc[1] >= 15)) break;

                if(matrix1[loc[0]*15 + loc[1]].id == 10) {
                    let LS = new LightSource(loc, l_dir, color);
                    LS_array.push(LS);
                    break;
                }
            }
            break;
        }
        case 11: { //量子鏡
            switch(diff) {
                case 6: {
                    for(let i=0; i<3; i++) {
                        if(color[i]) {
                            let single_color = [false, false, false];
                            single_color[i] = true;
                            AddQuantumColor(locate, (l_dir + 6) % 8, single_color, false);
                            AddQuantumColor(locate, (l_dir + 2) % 8, single_color, false);
                            let step1 = GetStep((l_dir + 6) % 8);
                            let step2 = GetStep((l_dir + 2) % 8);
                            let loc1 = new Array<number>(2);
                            let loc2 = new Array<number>(2);
                            loc1[0] = locate[0] + step1[0];
                            loc1[1] = locate[1] + step1[1];
                            loc2[0] = locate[0] + step2[0];
                            loc2[1] = locate[1] + step2[1];
                            let LS1 = new LightSource(loc1, (l_dir + 6) % 8, single_color);
                            let LS2 = new LightSource(loc2, (l_dir + 2) % 8, single_color);
                            if(loc1[0]<0 || loc1[0]>=15 || loc1[1]<0 || loc1[1]>=15) LS1 = null;
                            if(loc2[0]<0 || loc2[0]>=15 || loc2[1]<0 || loc2[1]>=15) LS2 = null;
                            QuantumLightTravel(LS1, LS2, LS_array);
                        }
                    }
                    break;
                }
                default: break;
            }
            break;
        }
        case 13: { //旋轉鏡（順時針）
            let LS = new LightSource(locate, (l_dir + 6) % 8, color);
            LS_array.push(LS);
            break;
        }
        case 14: { //旋轉鏡（逆時針）
            let LS = new LightSource(locate, (l_dir + 2) % 8, color);
            LS_array.push(LS);
            break;
        }
        case 15: { //擇色鏡（紅）
            switch(diff) {
                case 0:
                case 4: {
                    if(color[0]) {
                        let LS1 = new LightSource(locate, l_dir, [true, false, false]);
                        LS_array.push(LS1);
                    }
                    if(color[1] || color[2]) {
                        let LS2 = new LightSource(locate, (l_dir + 4) % 8, [false, color[1], color[2]]);
                        LS_array.push(LS2);
                    }
                    break;
                }
                case 1:
                case 5: {
                    if(color[0]) {
                        let LS1 = new LightSource(locate, l_dir, [true, false, false]);
                        LS_array.push(LS1);
                    }
                    if(color[1] || color[2]) {
                        let LS2 = new LightSource(locate, (l_dir + 6) % 8, [false, color[1], color[2]]);
                        LS_array.push(LS2);
                    }
                    break;
                }
                case 3:
                case 7: {
                    if(color[0]) {
                        let LS1 = new LightSource(locate, l_dir, [true, false, false]);
                        LS_array.push(LS1);
                    }
                    if(color[1] || color[2]) {
                        let LS2 = new LightSource(locate, (l_dir + 2) % 8, [false, color[1], color[2]]);
                        LS_array.push(LS2);
                    }
                    break;
                }
                default: break;
            }
            break;
        }
        case 16: { //擇色鏡（綠）
            switch(diff) {
                case 0:
                case 4: {
                    if(color[1]) {
                        let LS1 = new LightSource(locate, l_dir, [false, true, false]);
                        LS_array.push(LS1);
                    }
                    if(color[0] || color[2]) {
                        let LS2 = new LightSource(locate, (l_dir + 4) % 8, [color[0], false, color[2]]);
                        LS_array.push(LS2);
                    }
                    break;
                }
                case 1:
                case 5: {
                    if(color[1]) {
                        let LS1 = new LightSource(locate, l_dir, [false, true, false]);
                        LS_array.push(LS1);
                    }
                    if(color[0] || color[2]) {
                        let LS2 = new LightSource(locate, (l_dir + 6) % 8, [color[0], false, color[2]]);
                        LS_array.push(LS2);
                    }
                    break;
                }
                case 3:
                case 7: {
                    if(color[1]) {
                        let LS1 = new LightSource(locate, l_dir, [false, true, false]);
                        LS_array.push(LS1);
                    }
                    if(color[0] || color[2]) {
                        let LS2 = new LightSource(locate, (l_dir + 2) % 8, [color[0], false, color[2]]);
                        LS_array.push(LS2);
                    }
                    break;
                }
                default: break;
            }
            break;
        }
        case 17: { //擇色鏡（藍）
            switch(diff) {
                case 0:
                case 4: {
                    if(color[2]) {
                        let LS1 = new LightSource(locate, l_dir, [false, false, true]);
                        LS_array.push(LS1);
                    }
                    if(color[0] || color[1]) {
                        let LS2 = new LightSource(locate, (l_dir + 4) % 8, [color[0], color[1], false]);
                        LS_array.push(LS2);
                    }
                    break;
                }
                case 1:
                case 5: {
                    if(color[2]) {
                        let LS1 = new LightSource(locate, l_dir, [false, false, true]);
                        LS_array.push(LS1);
                    }
                    if(color[0] || color[1]) {
                        let LS2 = new LightSource(locate, (l_dir + 6) % 8, [color[0], color[1], false]);
                        LS_array.push(LS2);
                    }
                    break;
                }
                case 3:
                case 7: {
                    if(color[2]) {
                        let LS1 = new LightSource(locate, l_dir, [false, false, true]);
                        LS_array.push(LS1);
                    }
                    if(color[0] || color[1]) {
                        let LS2 = new LightSource(locate, (l_dir + 2) % 8, [color[0], color[1], false]);
                        LS_array.push(LS2);
                    }
                    break;
                }
                default: break;
            }
            break;
        }
        case 18: { //多用濾光鏡
            switch(diff) {
                case 0:
                case 4: {
                    if(color[1]) {
                        let LS = new LightSource(locate, l_dir, [false, true, false]);
                        LS_array.push(LS);
                    }
                    break;
                }
                case 1:
                case 5: {
                    if(color[2]) {
                        let LS = new LightSource(locate, l_dir, [false, false, true]);
                        LS_array.push(LS);
                    }
                    break;
                }
                case 2:
                case 6: {
                    let LS = new LightSource(locate, l_dir, color);
                    LS_array.push(LS);
                    break;
                }
                case 3:
                case 7: {
                    if(color[0]) {
                        let LS = new LightSource(locate, l_dir, [true, false, false]);
                        LS_array.push(LS);
                    }
                    break;
                }
                default: break;
            }
            break;
        }
        default: break;
    }
}

export function LightTravel(LS_array:LightSource[]) {
    while(LS_array.length > 0) {
        let LS = LS_array.pop();
        AddColor(LS.locate, LS.dir, LS.color, false);
        
        let id:number = -1;
        let step = GetStep(LS.dir);
        let locate:number[] = new Array<number>(2);
        locate[0] = LS.locate[0];
        locate[1] = LS.locate[1];

        while(true) {
            locate[0] = locate[0] + step[0];
            locate[1] = locate[1] + step[1];

            if((locate[0] < 0) || (locate[0] >= 15)) break;
            if((locate[1] < 0) || (locate[1] >= 15)) break;
            
            let [r, g, b] = GetInColor(locate, (LS.dir + 4) % 8);
            if((!LS.color[0] || r) && (!LS.color[1] || g) && (!LS.color[2] || b)) break;

            if(matrix1[locate[0]*15 + locate[1]].id > 0) {
                id = matrix1[locate[0]*15 + locate[1]].id;
                break;
            }

            AddColor(locate, (LS.dir + 4) % 8, LS.color, true);
            AddColor(locate, LS.dir, LS.color, false);
        }

        if(id > 0 && id != 102) {
            AddColor(locate, (LS.dir + 4) % 8, LS.color, true);
            let m_dir = matrix1[locate[0]*15 + locate[1]].mirrordir;
            NewLS(id, locate, m_dir, LS.dir, LS.color, LS_array);
        }
    }
}
