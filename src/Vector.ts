import { Point } from './Point.js';

export class Vector {
    public x: number;
    public y: number;


    // TODO: ytterligare konstruktor där man anger x och y-komponent

    constructor(xComponent: number, yComponent: number)
    constructor(point1: Point, point2: Point)
    constructor(pointOrXComponent: Point | number, pointOrYComponent: Point | number) {
        if (pointOrXComponent instanceof Point && pointOrYComponent instanceof Point) {
            this.x = pointOrYComponent.x - pointOrXComponent.x;
            this.y = pointOrYComponent.y - pointOrXComponent.y;
        } else if (typeof pointOrXComponent === 'number' && typeof pointOrYComponent === 'number') {
            this.x = pointOrXComponent;
            this.y = pointOrYComponent;
        } else {
            throw new Error('Invalid parameters');
        }

    }

    get norm(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    static dotProduct(vector1: Vector, vector2: Vector): number {
		return (vector1.x * vector2.x + vector1.y * vector2.y);
	}


}

