import { Polygon } from './Polygon.js';
import { PolygonState } from './PolygonState.js';
import { Point } from './Point.js';
import { ClosedState } from './ClosedState.js';
import { Segment } from './Segment.js';
import { Coordinate } from './Coordinate.js';
import { PaintableSegment } from './PaintableSegment.js';

export class MoveState implements PolygonState {

    private polygon: Polygon;

    constructor(polygon: Polygon) {
        this.polygon = polygon;
    }

    handleLeftClick(pointClicked: Point): void {
        //
    }

    handleRightClick(pointClicked: Point): void {
        this.abortTheMove();
    }

    handleLeftMouseDown(pointClicked: Point): void {
        //
    }

    handleLeftMouseUp(pointClicked: Point): void {
        const verticesToCheck: Point[] = this.polygon.verticesExceptMovePoint;
        if (pointClicked.noneOfThesePointsTooClose(verticesToCheck, Polygon.minimumDistanceBetweenPoints)) {
            if (this.noIntersectingSegmentsWhenMoving(pointClicked)) {
                this.moveSelectedVertexTo(pointClicked);
            } else {
                console.warn('Moving vertex there will cause segments to intersect.');
            }
        } else {
            console.warn('Moved vertex is too close to other vertex.');
        }
    }

    abortTheMove(): void {
        this.polygon.movePoint = null;
        this.polygon.setCurrentState(new ClosedState(this.polygon));
    }

    noIntersectingSegmentsWhenMoving(candidateLocation: Point): boolean {
        return this.movedSegmentsDoNotIntersect(candidateLocation);
    }

    moveSelectedVertexTo(toPoint: Point): void {
        this.polygon.movePoint.copyValues(toPoint); // copying values to point referenced by movePoint
        this.polygon.movePoint = null; // removing the reference
        this.polygon.setCurrentState(new ClosedState(this.polygon));
    }

    movedSegmentsDoNotIntersect(candidateLocation: Point): boolean {
        const segments: Segment[] = this.calculateSegments();
        if (segments.length > 3) {

            const precedingVertex: Point = this.polygon.getPrecedingVertex(this.polygon.movePoint);
            const followingVertex: Point = this.polygon.getFollowingVertex(this.polygon.movePoint);

            const precedingSegment: Segment = new Segment(precedingVertex, candidateLocation);
            const followingSegment: Segment = new Segment(candidateLocation, followingVertex);

            // no need to check if neighbouring segments intersect with current segment
            for (const segment of segments) {

                if (segment.containsThisVertex(this.polygon.movePoint)) { continue; }

                if (segment.doesNotContainThisVertex(precedingVertex)) {
                    if (segment.intersectsThisSegment(precedingSegment)) { return false; }
                }

                if (segment.doesNotContainThisVertex(followingVertex)) {
                    if (segment.intersectsThisSegment(followingSegment)) { return false; }
                }
            }

        }
        return true;
    }

    // TODO: borde jag skriva om den här. Nu returnerar den samma segment som i closedState.
    // Borde det vara segmenten så som den ser ut i move?
    calculateSegments(): Segment[] {
        const calculatedSegments: Segment[] = new Array();
        for (const vertex of this.polygon.vertices) {
            const followingVertex: Point = this.polygon.getFollowingVertex(vertex);
            const currentSegment: Segment = new Segment(vertex, followingVertex);
            calculatedSegments.push(currentSegment);
        }
        return calculatedSegments;
    }

    calculatePaintableStillSegments(): PaintableSegment[] {
        const paintableSegment: PaintableSegment[] = new Array();
        for (const segment of this.polygon.segments) {
            if (segment.doesNotContainThisVertex(this.polygon.movePoint)) {
                paintableSegment.push({ p1: segment.p1, p2: segment.p2 });
            }
        }
        return paintableSegment;
    }


    calculatePaintableMovingSegments(mousePosition: Coordinate): PaintableSegment[] {
        const paintableSegment: PaintableSegment[] = new Array();

        const pointBefore: Point = this.polygon.getPrecedingVertex(this.polygon.movePoint);
        const pointAfter: Point = this.polygon.getFollowingVertex(this.polygon.movePoint);
        paintableSegment.push({ p1: pointBefore, p2: mousePosition });
        paintableSegment.push({ p1: pointAfter, p2: mousePosition });
        return paintableSegment;
    }
}