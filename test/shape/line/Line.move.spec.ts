import { expect } from 'chai';
import { Line } from '../../../built/shape/line/Line.js';


function getLineInStateMoving(): Line {
    const line: Line = new Line();
    line.handleLeftMouseDown({x: 100, y: 120});
    return line;
}

describe('Line - move', () => {

    it('Length ', () => {
        const line: Line = getLineInStateMoving();
        expect(line.length).to.equal(0);
    });

    it('getter p1', () => {
        const line: Line = getLineInStateMoving();
        expect(line.p1.x).to.equal(100);
        expect(line.p1.y).to.equal(120);
    });

    it('getter movePoint', () => {
        const line: Line = getLineInStateMoving();
        expect(line.movePoint).not.to.equal(null);
    });

    it('calculateSegment()', () => {
        const line: Line = getLineInStateMoving();
        expect(line.segment).to.equal(null);
    });

    it('calculateStillSegment()', () => {
        const line: Line = getLineInStateMoving();
        expect(line.getStillSegment()).to.equal(null);
    });

    it('calculateMovingSegment()', () => {
        const line: Line = getLineInStateMoving();
        expect(line.getMovingSegment({ x: 100, y: 200 }).length).to.equal(80);
    });

    it('handleLeftMouseDown() - succesful move', () => {
        const line: Line = getLineInStateMoving();
        line.handleLeftMouseUp({x: 8, y: 9});
        expect(line.p2.x).to.equal(8);
        expect(line.p2.y).to.equal(9);
        expect(line.isComplete).to.equal(true);
    });

    it('handleLeftMouseDown() - unsuccesful move', () => {
        const line: Line = getLineInStateMoving();
        line.handleLeftMouseUp({x: 100, y: 121});
        expect(line.isMoving).to.equal(true);
    });

    it('handleLeftMouseDown() - moving p1', () => {
        const line: Line = new Line({x:45, y:40},{x:90, y:88});
        expect(line.isComplete).to.equal(true);
        line.handleLeftMouseDown({x:46, y: 41});
        expect(line.isMoving).to.equal(true);
        line.handleLeftMouseUp({x:10, y: 15});
        expect(line.isComplete).to.equal(true);
        expect(line.p1.x).to.equal(10);
        expect(line.p1.y).to.equal(15);
    });

});