
export class Square {
    public id:number;
    public mirrordir:number;
    public lightdir:boolean[];

    constructor(){
        this.id = -1;
        this.mirrordir = 0;
        this.lightdir = new Array<boolean>(8*9);

        let i:number;
        for(i=0; i<8*9; i++) {
            this.lightdir[i] = false;
        }
    }
}

let i:number;
let matrix1 = new Array<Square>(15*15);
let matrix2 = new Array<boolean>(2*12);

for(i=0; i<15*15; i++) matrix1[i] = new Square();
for(i=0; i<2*12; i++) matrix2[i] = false;
export {matrix1, matrix2};

export function ClearMatrix() {
    let i:number, j:number;
    for(i=0; i<15*15; i++) {
        matrix1[i].id = -1;
        for(j=0; j<8*9; j++) {
            matrix1[i].lightdir[j] = false;
        }
    }
    for(i=0; i<12*2; i++) {
        matrix2[i] = false;
    }
}

export function GetColor(locate:number[], dir:number):boolean[] {
    let index1 = locate[0]*15 + locate[1];
    let index2 = dir*9;

    let r = matrix1[index1].lightdir[index2];
    let g = matrix1[index1].lightdir[index2 + 1];
    let b = matrix1[index1].lightdir[index2 + 2];

    return [r, g, b];
}

export function GetInColor(locate:number[], dir:number):boolean[] {
    let index1 = locate[0]*15 + locate[1];
    let index2 = dir*9;

    let r = matrix1[index1].lightdir[index2 + 3];
    let g = matrix1[index1].lightdir[index2 + 4];
    let b = matrix1[index1].lightdir[index2 + 5];

    return [r, g, b];
}

export function GetTotalColor(locate:number[]):boolean[] {
    let r:boolean = false, g:boolean = false, b:boolean = false;
    let index1 = locate[0]*15 + locate[1];
    let dir:number, index2:number;

    for(dir=0; dir<8; dir++) {
        index2 = dir*9;
        r ||= (matrix1[index1].lightdir[index2 + 3] || matrix1[index1].lightdir[index2 + 6]);
        g ||= (matrix1[index1].lightdir[index2 + 4] || matrix1[index1].lightdir[index2 + 7]);
        b ||= (matrix1[index1].lightdir[index2 + 5] || matrix1[index1].lightdir[index2 + 8]);
    }

    return [r, g, b];
}

export function AddColor(locate:number[], dir:number, color:boolean[], io:boolean) {
    let index1 = locate[0]*15 + locate[1];
    let index2 = dir*9;

    matrix1[index1].lightdir[index2] ||= color[0];
    matrix1[index1].lightdir[index2 + 1] ||= color[1];
    matrix1[index1].lightdir[index2 + 2] ||= color[2];

    if(io) {
        matrix1[index1].lightdir[index2 + 3] ||= color[0];
        matrix1[index1].lightdir[index2 + 4] ||= color[1];
        matrix1[index1].lightdir[index2 + 5] ||= color[2];
    }
}

export function AddQuantumColor(locate:number[], dir:number, color:boolean[], io:boolean) {
    let index1 = locate[0]*15 + locate[1];
    let index2 = dir*9;

    matrix1[index1].lightdir[index2] ||= color[0];
    matrix1[index1].lightdir[index2 + 1] ||= color[1];
    matrix1[index1].lightdir[index2 + 2] ||= color[2];

    if(io) {
        matrix1[index1].lightdir[index2 + 6] ||= color[0];
        matrix1[index1].lightdir[index2 + 7] ||= color[1];
        matrix1[index1].lightdir[index2 + 8] ||= color[2];
    }
}
