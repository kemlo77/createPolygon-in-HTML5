class Polygon {
    public segments: Segment[];
    public seed: Point;
    public vertices: Point[];
    public movePointIndex: number;
    private currentState: PolygonState;
    private enforceNonComplex: boolean;
    private enforceClockWise: boolean;

    constructor() {
        this.segments = new Array();
        this.vertices = new Array();
        this.seed = null;
        this.movePointIndex = -1; //TODO: går det skriva om koden så att MoveState får den här punkten från ClosedState?
        this.currentState = OpenState.getInstance();
        this.enforceNonComplex = true;
        this.enforceClockWise = true;
    }

    get enforceNonComplexPolygon() {
        return this.enforceNonComplex;
    }

    get enforceClockWisePolygon() {
        return this.enforceClockWise;
    }

    setCurrentState(state: PolygonState): void {
        this.currentState = state;
        console.log("Change state to: " + state.stateName());
    }

    handleLeftClick(point: Point): void {
        this.currentState.handleLeftClick(this, point);
    }

    handleRightClick(point: Point): void {
        this.currentState.handleRightClick(this, point);
    }

    drawSegments(): void {
        this.currentState.drawSegments(this);
    }

    drawMovement(mousePosition: Point): void {
        this.currentState.drawMovement(this, mousePosition);
    }

    //changing direction of polygon (clockwise <-> counter clockwise)
    reversePolygon(): void {
        this.vertices.reverse();
    }

    //inserting a new point (+segment) in a polygon segment array, at a given index
    insertPoint(newPointIn: Point, insertAtThisIndex: number): void {
        //splitting a segment (A-B) that is given a new point
        //the new Segment goes from breakPoint to point B
        //the old segment is changed so that it goes from point A to the breakPoint
        //new Segment starts at the breaking point, ends where the divided segment ended (B)
        let tempSegmentToInsert: Segment = new Segment(newPointIn, this.segments[insertAtThisIndex].p2);
        //add new Segment after the break
        this.segments.splice(insertAtThisIndex + 1, 0, tempSegmentToInsert);
        //chagning segment before the break so that the end point is now the breakPoint
        this.segments[insertAtThisIndex].p2 = newPointIn;
    }

    insertVertex(newPoint: Point, insertAtThisIndex: number): void {
        this.vertices.splice(insertAtThisIndex+1,0, newPoint);
    }

    get clockWise(): boolean {
        if (this.currentState instanceof ClosedState) {
            let theSum: number = 0;
            for (let b = 0; b < this.segments.length; b++) {
                theSum += this.segments[b].p1.x * this.segments[b].p2.y - this.segments[b].p1.y * this.segments[b].p2.x;
            }
            let area: number = theSum / 2;
            //see also http://en.wikipedia.org/wiki/Curve_orientation
            if (area > 0) {
                return true;
            }
            else {
                return false;
            }
        } else {
            return null;
        }
    }

    get area(): number {
        //TODO: lägga detta i closed state istället
        if (this.currentState instanceof ClosedState) {
            //using the Gauss shoelace formula
            //http://en.wikipedia.org/wiki/Shoelace_formula
            let theSum: number = 0;
            for (let b = 0; b < this.segments.length; b++) {
                theSum += this.segments[b].p1.x * this.segments[b].p2.y - this.segments[b].p1.y * this.segments[b].p2.x;
            }
            return theSum / 2;
        } else {
            return 0;
        }
    }

    get perimeterLength(): number {
        return this.segments.reduce((sum, it) => sum + it.length, 0)
    }

    //changing the starting point in the polygon (i.e. chaing what segment is the starting segment)
    revolFirstIndex(newFirstIndex: number): void {
        if (this.currentState instanceof ClosedState) {
            //handling if newFirstIndex is larger than the number of segments
            let newFirstIndexHandled: number = moduloInPolygon(newFirstIndex, this.segments.length);
            //removing the group of segments (up until newfirstindex)
            let tempArray: Segment[] = this.segments.splice(0, newFirstIndexHandled + 1);
            //l�gger den stumpen p� slutet
            //adding the group of segments to the end of the other part
            this.segments = this.segments.concat(tempArray);
            //changing the polygon seed point to the first point
            this.seed = this.segments[0].p1;
        }
    }

    //removing a point (+segment) from a polygon segment-array, at a given index
    ejectPoint(removeAtThisIndex: number): void {
        //the point to be removed is the first point in the segment with index=removeAtThisIndex
        //the index for the segment prior to the segment removed (handled if removeAtThisIndex==0)
        let indexBeforeRemoveAtThisIndex: number = moduloInPolygon((removeAtThisIndex - 1), this.segments.length);
        //changing the "second point in the prior segment" to the second point in the segment to be removed
        this.segments[indexBeforeRemoveAtThisIndex].p2 = this.segments[removeAtThisIndex].p2;
        //removing the segment
        this.segments.splice(removeAtThisIndex, 1);
    }

    ejectVertex(removeAtThisIndex: number): void {
        this.vertices.splice(removeAtThisIndex, 1);
    }







}