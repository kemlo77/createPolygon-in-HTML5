import { Polygon } from './Polygon.js';
import { MoveState } from './MoveState.js';
import { PolygonState } from './PolygonState.js';
import { Point } from '../Point.js';
import { OpenState } from './OpenState.js';
import { Segment } from '../Segment.js';
import { MathUtil } from '../MathUtil.js';
import { Coordinate } from '../Coordinate.js';
import { UnselectedState } from './UnselectedState.js';

export class ClosedState implements PolygonState {

    private polygon: Polygon;

    constructor(polygon: Polygon) {
        this.polygon = polygon;
    }


    handleLeftClick(pointClicked: Point): void {
        const vertexSelectedForMove: Point =
            pointClicked.nearestPointWithinDistance(this.polygon.vertices, Polygon.interactDistance);
        if (vertexSelectedForMove === null) {
            const segmentClicked: Segment = this.nearestSegmentWithinDistance(pointClicked, Polygon.interactDistance);
            if (segmentClicked === null) {
                this.polygon.setCurrentState(new UnselectedState(this.polygon, this));
            }
        }
    }

    handleRightClick(pointClicked: Point): void {
        const removeCandidateVertex: Point =
            pointClicked.nearestPointWithinDistance(this.polygon.vertices, Polygon.interactDistance);

        if (removeCandidateVertex !== null) {
            if (this.polygon.numberOfSegments > 3) {
                if (this.noIntersectingSegmentsWhenRemovingVertex(removeCandidateVertex)) {
                    this.removeSelectedVertex(removeCandidateVertex);
                } else {
                    console.warn('Removing that point will cause remaining segments to intersect.');
                }
            } else {
                console.warn('Cannot remove vertex when polygon is a triangle.');
            }
        }
        else {
            const segmentClicked: Segment = this.nearestSegmentWithinDistance(pointClicked, Polygon.interactDistance);
            if (segmentClicked !== null) {
                this.removeSelectedSegment(segmentClicked);
            }
        }
    }

    handleLeftMouseDown(pointClicked: Point): void {
        const vertexSelectedForMove: Point =
            pointClicked.nearestPointWithinDistance(this.polygon.vertices, Polygon.interactDistance);
        if (vertexSelectedForMove !== null) {
            this.beginMovingThisVertex(vertexSelectedForMove, pointClicked);
        }
        else {
            const segmentClicked: Segment = this.nearestSegmentWithinDistance(pointClicked, Polygon.interactDistance);
            if (segmentClicked !== null) {
                const candidateVertex: Point = MathUtil.projectPointOntoSegment(segmentClicked, pointClicked);
                if (this.notToCloseToNeighborsOnSegment(segmentClicked, candidateVertex)) {
                    this.polygon.insertVertex(candidateVertex, segmentClicked);
                    this.beginMovingThisVertex(candidateVertex, pointClicked);
                } else {
                    console.warn('New vertex too close to other vertex.');
                }
            } else {
                this.polygon.setCurrentState(new UnselectedState(this.polygon, this));
            }
        }
    }

    private notToCloseToNeighborsOnSegment(segment: Segment, candidateVertex: Point): boolean {
        const distanceToP1: number = candidateVertex.distanceToOtherPoint(segment.p1);
        const distanceToP2: number = candidateVertex.distanceToOtherPoint(segment.p2);
        const farEnoughFromP1: boolean = distanceToP1 > Polygon.minimumDistanceBetweenPoints;
        const farEnoughFromP2: boolean = distanceToP2 > Polygon.minimumDistanceBetweenPoints;
        return farEnoughFromP1 && farEnoughFromP2;
    }

    private beginMovingThisVertex(vertex: Point, pointClicked: Point): void {
        this.polygon.movePoint = vertex;
        this.polygon.mousePositionAtMoveStart = pointClicked;
        this.polygon.setCurrentState(new MoveState(this.polygon));
    }

    /* istanbul ignore next */
    handleLeftMouseUp(pointClicked: Point): void {
        //
    }

    private removeSelectedSegment(segment: Segment): void {
        this.polygon.makeThisVertexFirst(segment.p2);
        this.polygon.setCurrentState(new OpenState(this.polygon));
    }

    private removeSelectedVertex(vertex: Point): void {
        this.polygon.ejectVertex(vertex);
    }

    private noIntersectingSegmentsWhenRemovingVertex(removeCandidateVertex: Point): boolean {
        return !this.checkIfRemovedPointCausesSegmentIntersect(removeCandidateVertex);
    }

    private checkIfRemovedPointCausesSegmentIntersect(deleteCandidateVertex: Point): boolean {
        const segmentArrayIn: Segment[] = this.polygon.segments;
        // A four sided polygon loosing a side becomes a triangle, that can have no sides intersecting.
        if (segmentArrayIn.length > 4) {
            const precedingVertex: Point = this.polygon.getPrecedingVertex(deleteCandidateVertex);
            const followingVertex: Point = this.polygon.getFollowingVertex(deleteCandidateVertex);
            const thePotentialNewSegment: Segment = new Segment(precedingVertex, followingVertex);
            for (const segment of this.polygon.segments) {
                if (segment.containsThisVertex(precedingVertex) || segment.containsThisVertex(followingVertex)) {
                    continue;
                }
                if (thePotentialNewSegment.intersectsThisSegment(segment)) {
                    return true;
                }
            }
        }
        return false;
    }

    private nearestSegmentWithinDistance(candidatePoint: Point, minDistanceIn: number): Segment {
        let smallestRecordedDistance: number = minDistanceIn;
        let segmentProjectedOn: Segment = null;

        for (const segment of this.polygon.segments) {
            const distance: number =
                MathUtil.distanceBetweenPointAndPointProjectedOnSegment(segment, candidatePoint);

            if (distance < minDistanceIn) {
                if (distance < smallestRecordedDistance) {
                    smallestRecordedDistance = distance;
                    segmentProjectedOn = segment;
                }
            }
        }
        return segmentProjectedOn;
    }

    calculateSegments(): Segment[] {
        const calculatedSegments: Segment[] = [];
        for (const vertex of this.polygon.vertices) {
            const followingVertex: Point = this.polygon.getFollowingVertex(vertex);
            const currentSegment: Segment = new Segment(vertex, followingVertex);
            calculatedSegments.push(currentSegment);
        }
        return calculatedSegments;
    }

    calculateStillSegments(): Segment[] {
        return this.calculateSegments();
    }

    calculateMovingSegments(mousePosition: Coordinate): Segment[] {
        return [];
    }

}
