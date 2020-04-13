import { Polygon } from './Polygon.js';
import { MoveState } from './MoveState.js';
import { PolygonState } from './PolygonState.js';
import { Point } from './Point.js';
import { OpenState } from './OpenState.js';
import { Segment } from './Segment.js';
import { moduloInPolygon, calculateIntersect, projectVector } from './math.js';
import { ProjectionResult } from './ProjectionResult.js';
import { CanvasPainter } from './CanvasPainter.js';

export class ClosedState implements PolygonState {

    private static instance: ClosedState;

    private constructor() { }

    public static getInstance(): ClosedState {
        if (!ClosedState.instance) {
            ClosedState.instance = new ClosedState();
        }
        return ClosedState.instance;
    }

    stateName(): string { return 'ClosedState'; } // TODO: ta bort senare

    handleLeftClick(polygon: Polygon, pointClicked: Point): void {
        const nearPointIndex: number = pointClicked.isCloseToPoints(polygon.vertices, polygon.markForMoveDistance);
        if (nearPointIndex > -1) {
            // on point (mark for move) -> MoveState
            polygon.movePointIndex = nearPointIndex;
            polygon.setCurrentState(MoveState.getInstance());

        }
        else {
            // on vertex (new point)
            // if the click occured near a segment, insert a new point
            const projection: PointToSegmentProjection = this.checkIfCloseToLine(polygon.segments, pointClicked, polygon.insertNewPointDistance);
            if (projection.withinMinimumDistance) {
                // rounding coordinates to get integers
                if (polygon.useIntegerCoordinates) {
                    projection.projectionPointOnSegment.x = Math.round(projection.projectionPointOnSegment.x);
                    projection.projectionPointOnSegment.y = Math.round(projection.projectionPointOnSegment.y);
                } else {
                    projection.projectionPointOnSegment.x = Math.round(projection.projectionPointOnSegment.x * 100) / 100;
                    projection.projectionPointOnSegment.y = Math.round(projection.projectionPointOnSegment.y * 100) / 100;
                }
                // calculating distance to both points on clicked segment
                // so that it is not possible to insert a point too close to another
                const segmPointDist1: number = projection.projectionPointOnSegment.distanceToOtherPoint(polygon.segments[projection.segmentIndex].p1);
                const segmPointDist2: number = projection.projectionPointOnSegment.distanceToOtherPoint(polygon.segments[projection.segmentIndex].p2);
                if (((segmPointDist1 > polygon.minimumDistanceBetweenPoints) && (segmPointDist2 > polygon.minimumDistanceBetweenPoints))) {
                    // inserting the point in the segment-array
                    polygon.insertVertex(projection.projectionPointOnSegment, projection.segmentIndex);
                } else {
                    console.warn('New vertex too close to other vertex.');
                }
            }
        }
    }

    handleRightClick(polygon: Polygon, pointClicked: Point): void {
        // if the user rightclicked a point, remove it if there are more than 3 sides to the polygon
        const nearPointIndex: number = pointClicked.isCloseToPoints(polygon.vertices, polygon.deleteDistance);
        if (nearPointIndex > -1) {
            // if polygon has more than 3 sides it is ok to remove point (+segment)
            if (polygon.vertices.length > 3) {
                // check that the segment created to fill the gap does not intersect with other segments
                if (polygon.enforceNonComplexPolygon) {
                    if (!this.checkIfRemovedPointCausesSegmentIntersect(polygon.segments, nearPointIndex)) {
                        // no intersects found
                        polygon.ejectVertex(nearPointIndex);
                    }
                    else {
                        console.warn('Removing that point will cause remaining segments to intersect.');
                    }
                }
                else {
                    polygon.ejectVertex(nearPointIndex);
                }
            } else {
                console.warn('Cannot remove vertex when polygon is a triangle.');
            }
        }
        // erase segment if user right clicked "on" segment
        else {
            // check if click was near segment
            const projection: PointToSegmentProjection = this.checkIfCloseToLine(polygon.segments, pointClicked, polygon.deleteDistance);
            if (projection.withinMinimumDistance) {// true if user clicked close enough to segment
                // Changing start segment so that the one to be removed is the last one
                polygon.rotateVertices(projection.segmentIndex + 1);
                // opening polygon and removing last segment
                polygon.setCurrentState(OpenState.getInstance());
            }
        }
    }


    // TODO: Refactor and test this one thoroughly
    private checkIfRemovedPointCausesSegmentIntersect(segmentArrayIn: Segment[], deleteAtIndex: number): boolean {
        // needs only to be checked for polygons with 5 sides or more
        // i.e. a four sided polygon loosing a side becomes a triangle, that can have no sides intersecting.
        if (segmentArrayIn.length > 4) {
            // find index for the segment one step prior
            const indexBeforeDeleteAtIndex: number = moduloInPolygon(deleteAtIndex - 1, segmentArrayIn.length); // DAI-1
            // skapa ETT nya segment f�r valt index och det dessf�rrinnan
            // create ONE new Segment to replace chosen segment (at deleteAtIndex) and the segment prior
            const thePotentialNewSegment: Segment = new Segment(segmentArrayIn[indexBeforeDeleteAtIndex].p1, segmentArrayIn[deleteAtIndex].p2);
            // skipping the two segments to be replaced plus their neighbouring segments
            for (let p = 0; p < segmentArrayIn.length - 4; p++) {
                if (calculateIntersect(thePotentialNewSegment, segmentArrayIn[moduloInPolygon((p + deleteAtIndex + 2), segmentArrayIn.length)])) {
                    return true;
                }
            }
            // if coming this far, there is no intersect found
            return false;
        }
        else {
            // if polygon had 4 sides or less, it is automatically OK
            return false;
        }
    }


    // checking if new point is near other polygon segments
    checkIfCloseToLine(segmentArrayIn: Segment[], nyPunkt: Point, minDistanceIn: number): PointToSegmentProjection {
        let smallestDistance: number = minDistanceIn;
        let withinMinimumDistance: boolean = false;
        let segmentIndex: number = 0;
        let closestPoint: Point = new Point();
        // checking with every segment
        for (let j = 0; j < segmentArrayIn.length; j++) {
            // projecting point on segment
            const projectionResult: ProjectionResult = projectVector(segmentArrayIn[j], nyPunkt);
            // if it was between 0 and minDistanceIn
            if (projectionResult.successful && projectionResult.norm < minDistanceIn) {
                withinMinimumDistance = true;
                if (projectionResult.norm < smallestDistance) {
                    // if it is closer than minDistanceIn and closer than last saved, it is saved
                    smallestDistance = projectionResult.norm;
                    closestPoint = projectionResult.point;
                    segmentIndex = j;
                }
            }
        }
        const projectionPointOnSegment: Point = closestPoint;
        return {
            withinMinimumDistance,
            segmentIndex,
            projectionPointOnSegment
        };
    }

    drawSegments(polygon: Polygon): void {
        CanvasPainter.getInstance().drawClosedStatePolygon(polygon);
    }

    drawMovement(polygon: Polygon, mousePosition: Point): void {/**/ }


    calculateSegments(polygon: Polygon): Segment[] {
        const calculatedSegments: Segment[] = new Array();
        for (let index = 1; index < polygon.vertices.length; index++) {
            const pointA: Point = polygon.vertices[index - 1];
            const pointB: Point = polygon.vertices[index];
            const currentSegment: Segment = new Segment(pointA, pointB);
            calculatedSegments.push(currentSegment);
        }
        const lastPoint: Point = polygon.vertices[polygon.vertices.length - 1];
        const firstPoint: Point = polygon.vertices[0];
        const lastSegment: Segment = new Segment(lastPoint, firstPoint);
        calculatedSegments.push(lastSegment);
        return calculatedSegments;
    }

}

interface PointToSegmentProjection {
    withinMinimumDistance: boolean;
    // TODO: Jag kanske skulle kunna returnera det aktuella segmentet istället?
    // Beror lite på när jag tänker gå över till att Polygon bygger på Point istället för Segment.
    segmentIndex: number;
    projectionPointOnSegment: Point;
}