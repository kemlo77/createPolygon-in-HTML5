import { expect } from 'chai';
import { Polygon } from '../../built/polygon/Polygon';
import { PaintableSegment } from '../../src/polygon/PaintableSegment';
import { Segment } from '../../built/polygon/Segment';


describe('Polygon - closed', () => {


    for (let step: number = 0; step < 4; step++) {
        const square: Polygon = getSquare();
        it('Mark for move ' + step, () => {
            square.rotateVertices(step);
            square.handleLeftMouseDown({ x: 100, y: 100 });
            expect(square.isMoving).to.equal(true, 'Polygon not moving');
        });
    }

    it('Unselect - point clicked cannot be projected on segment', () => {
        const square: Polygon = getSquare();
        expect(square.isSelected).to.equal(true);
        square.handleLeftClick({ x: 10, y: 10 });
        expect(square.isSelected).to.equal(false, 'Polygon still selected');
    });

    it('Adding vertex to segment - clicking close to more than one vertex', () => {
        const rectangle: Polygon = new Polygon();
        rectangle.handleLeftClick({ x: 100, y: 100 });
        rectangle.handleLeftClick({ x: 108, y: 90 });
        rectangle.handleLeftClick({ x: 108, y: 210 });
        rectangle.handleLeftClick({ x: 100, y: 200 });
        rectangle.handleLeftClick({ x: 100, y: 100 });
        expect(rectangle.vertices.length).to.equal(4, ' wrong number of vertices before');
        expect(rectangle.isClosed).to.equal(true, ' not closed');
        rectangle.handleLeftMouseDown({ x: 104 , y: 150 });
        expect(rectangle.isMoving).to.equal(true, ' not moving');
        expect(rectangle.vertices.length).to.equal(5, ' wrong number of vertices after');
        
    });

    describe('Adding vertex to segment', () => {

        for (let step: number = 0; step < 4; step++) {
            const square: Polygon = getSquare();
            it('Adding vertex to segment ' + step, () => {
                square.rotateVertices(step);
                square.handleLeftMouseDown({ x: 150, y: 100 });
                expect(square.vertices.length).to.equal(5);
                expect(square.isMoving).to.equal(true);
            });
        }

        for (let step: number = 0; step < 4; step++) {
            const square: Polygon = getSquare();
            it('Trying to add vertex to segment - to close to existing vertex' + step, () => {
                square.rotateVertices(step);
                square.handleLeftClick({ x: 100 + Polygon.interactDistance + 1, y: 100 });
                expect(square.vertices.length).to.equal(4);
            });
        }

    });

    describe('Delete', () => {

        for (let step: number = 0; step < 8; step++) {
            const vShape: Polygon = new Polygon();
            vShape.handleLeftClick({ x: 100, y: 100 });
            vShape.handleLeftClick({ x: 100, y: 150 }); // extra vertex
            vShape.handleLeftClick({ x: 100, y: 200 });
            vShape.handleLeftClick({ x: 200, y: 500 }); // point to be removed
            vShape.handleLeftClick({ x: 300, y: 200 });
            vShape.handleLeftClick({ x: 300, y: 150 }); // extra vertex
            vShape.handleLeftClick({ x: 300, y: 100 });
            vShape.handleLeftClick({ x: 200, y: 400 });
            vShape.handleLeftClick({ x: 100, y: 100 }); // closing
            it('Removed vertex makes resulting new segment intersect with other segments ' + step, () => {
                vShape.rotateVertices(step);
                vShape.handleRightClick({ x: 200, y: 500 });
                expect(vShape.vertices.length).to.equal(8);
                expect(vShape.isClosed).to.equal(true, 'Polygon not closed');

            });
        }

        for (let step: number = 0; step < 3; step++) {
            const triangle: Polygon = new Polygon();
            triangle.handleLeftClick({ x: 100, y: 100 });
            triangle.handleLeftClick({ x: 300, y: 100 });
            triangle.handleLeftClick({ x: 200, y: 300 });
            triangle.handleLeftClick({ x: 100, y: 100 });
            it('Cannot remove when polygon only has 3 vertices ' + step, () => {
                triangle.rotateVertices(step);
                triangle.handleRightClick({ x: 100, y: 100 });
                expect(triangle.vertices.length).to.equal(3);
                expect(triangle.isClosed).to.equal(true, 'Polygon not closed');
            });
        }

        for (let step: number = 0; step < 4; step++) {
            const square: Polygon = getSquare();
            it('Trying to remove point but not within minimum distance ' + step, () => {
                square.rotateVertices(step);
                square.handleRightClick({ x: 100 - Polygon.interactDistance, y: 100 });
                expect(square.vertices.length).to.equal(4);
                expect(square.isClosed).to.equal(true, 'Polygon not closed');
            });
        }

        for (let step: number = 0; step < 4; step++) {
            const square: Polygon = getSquare();
            it('All points are possible to remove normally ' + step, () => {
                square.rotateVertices(step);
                square.handleRightClick({ x: 100, y: 100 });
                expect(square.vertices.length).to.equal(3);
                expect(square.isClosed).to.equal(true, 'Polygon not closed');
            });
        }

        for (let step: number = 0; step < 4; step++) {
            const square: Polygon = getSquare();
            it('Erasing segment and thus opening the polygon ' + step, () => {
                square.rotateVertices(step);
                square.handleRightClick({ x: 150, y: 100 });
                expect(square.vertices.length).to.equal(4);
                expect(square.isClosed).to.equal(false, 'Polygon still closed');
            });
        }

        for (let step: number = 0; step < 4; step++) {
            const square: Polygon = getSquare();
            it('trying to erase segment but not within minimum segment distance ' + step, () => {
                square.rotateVertices(step);
                square.handleRightClick({ x: 150, y: 100 + Polygon.interactDistance + 1 });
                expect(square.vertices.length).to.equal(4);
                expect(square.isClosed).to.equal(true, 'Polygon not closed.');
            });
        }

    });


    describe('Getting segments', () => {


        it('calculateSegments() - three vertices', () => {
            const shape: Polygon = new Polygon();
            shape.handleLeftClick({ x: 100, y: 100 });
            shape.handleLeftClick({ x: 300, y: 100 });
            shape.handleLeftClick({ x: 150, y: 300 });
            shape.handleLeftClick({ x: 100, y: 100 }); // closing it
            const segments: Segment[] = shape.segments;
            expect(segments.length).is.equal(3);
            expect(segments[0].p1.x).is.equal(100);
            expect(segments[0].p1.y).is.equal(100);
            expect(segments[0].p2.x).is.equal(300);
            expect(segments[0].p2.y).is.equal(100);

            expect(segments[1].p1.x).is.equal(300);
            expect(segments[1].p1.y).is.equal(100);
            expect(segments[1].p2.x).is.equal(150);
            expect(segments[1].p2.y).is.equal(300);

            expect(segments[2].p1.x).is.equal(150);
            expect(segments[2].p1.y).is.equal(300);
            expect(segments[2].p2.x).is.equal(100);
            expect(segments[2].p2.y).is.equal(100);
        });

        it('getPaintableStillSegments()', () => {
            const shape: Polygon = new Polygon();
            shape.handleLeftClick({ x: 100, y: 100 });
            shape.handleLeftClick({ x: 300, y: 100 });
            shape.handleLeftClick({ x: 150, y: 300 });
            shape.handleLeftClick({ x: 100, y: 100 }); // closing it
            const paintableStillSegments: PaintableSegment[] = shape.getPaintableStillSegments();
            expect(paintableStillSegments.length).is.equal(3);
            expect(paintableStillSegments[0].p1.x).is.equal(100);
            expect(paintableStillSegments[0].p1.y).is.equal(100);
            expect(paintableStillSegments[0].p2.x).is.equal(300);
            expect(paintableStillSegments[0].p2.y).is.equal(100);

            expect(paintableStillSegments[1].p1.x).is.equal(300);
            expect(paintableStillSegments[1].p1.y).is.equal(100);
            expect(paintableStillSegments[1].p2.x).is.equal(150);
            expect(paintableStillSegments[1].p2.y).is.equal(300);

            expect(paintableStillSegments[2].p1.x).is.equal(150);
            expect(paintableStillSegments[2].p1.y).is.equal(300);
            expect(paintableStillSegments[2].p2.x).is.equal(100);
            expect(paintableStillSegments[2].p2.y).is.equal(100);
        });

        it('calculatePaintableMovingSegments()', () => {
            const shape: Polygon = new Polygon();
            shape.handleLeftClick({ x: 100, y: 100 });
            shape.handleLeftClick({ x: 300, y: 100 });
            shape.handleLeftClick({ x: 150, y: 300 });
            shape.handleLeftClick({ x: 100, y: 100 }); // closing it

            const movingSegments: PaintableSegment[] = shape.getPaintableMovingSegments({ x: 300, y: 400 });

            expect(movingSegments.length).is.equal(0);
        });

    });

});

function getSquare(): Polygon {
    const square: Polygon = new Polygon();
    square.handleLeftClick({ x: 100, y: 100 });
    square.handleLeftClick({ x: 200, y: 100 });
    square.handleLeftClick({ x: 200, y: 200 });
    square.handleLeftClick({ x: 100, y: 200 });
    square.handleLeftClick({ x: 100, y: 100 });
    return square;
}