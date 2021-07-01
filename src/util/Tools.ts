
export namespace Tools {
    export const DESIGN_WIDTH = 640;        //设计宽度
    export const DESIGN_HEIGHT = 1280;      //设计高度
    export const width = 320                //使用宽度
    export const height = 640;              //使用高度
    //包括两端  随机整数
    export function randomInt(lower: number, upper: number): number {
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }
}