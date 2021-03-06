function init() {
	/* var canvas = document.getElementById("canvas"); */

/* 	if (canvas.getContext) {
		ctx = canvas.getContext("2d");
	} */
	var canvasBackground = document.getElementById("background");
	if (canvasBackground.getContext) {ctxBack = canvasBackground.getContext("2d");}
	var canvasForeground = document.getElementById("foreground");
	if (canvasForeground.getContext) {ctxFront = canvasForeground.getContext("2d");}
	IWIDTH=canvasBackground.width;
	IHEIGHT=canvasBackground.height;
}

function clearEntirely(){
	firstPolygon.segments=[];
	firstPolygon.closed=false;
	firstPolygon.seed=false;
	clearTheCanvas(ctxFront);
	clearTheCanvas(ctxBack);
}

//*************************
//** Handle clicks       **
//*************************
function handleClick(isLeftClick,theClickedPoint){
	if(isLeftClick){
		if(firstPolygon.closed){
			if(firstPolygon.moveMode){leftClickClosedMoveMode(firstPolygon,theClickedPoint)}//LEFT - CLOSED - MOVEMODE
			else{leftClickClosed(firstPolygon,theClickedPoint)}//LEFT - CLOSED
		}
		else{leftClickOpen(firstPolygon,theClickedPoint)}//LEFT - OPEN
	}
	else{
		if(firstPolygon.closed){
			if(firstPolygon.moveMode){rightClickClosedMoveMode(firstPolygon)}//RIGHT - CLOSED - MOVEMODE
			else{rightClickClosed(firstPolygon,theClickedPoint)}//RIGHT - CLOSED
		}
		else{rightClickOpen(firstPolygon)}//RIGHT - OPEN
	}
	//calculate area and check if polygon is drawn clockwise or not
	firstPolygon.gShoeLace();
	//change to clockwise if checkbox is ticked
	if(!firstPolygon.clockWise&&document.getElementById("checkboxEnforceClockwise").checked){
		firstPolygon.reversePolygon();
	}
	drawPolygon(firstPolygon);
	//clearUsedCanvas();
	drawMovement(theClickedPoint,firstPolygon)
}

function leftClickClosed(handledPolygon,newlyClickedPoint){
	var nearPointIndex=checkIfCloseToPoint(handledPolygon.segments,newlyClickedPoint,moveDelInsDistance);
	if(nearPointIndex>-1){
		handledPolygon.moveMode=true;
		handledPolygon.movePointIndex=nearPointIndex;
	}
	else{
		//if the click occured near a segment, insert a new point
		var tempVar = checkIfCloseToLine(handledPolygon.segments,newlyClickedPoint,moveDelInsDistance);
		if(tempVar[0]){
			//rounding coordinates to get integers
			if(useIntegerCoords){
				tempVar[2].x=Math.round(tempVar[2].x);
				tempVar[2].y=Math.round(tempVar[2].y);
			}
			//calculating distance to both points on clicked segment
			//so that it is not possible to insert a point too close to another
			segmPointDist1=distBetweenPoints(handledPolygon.segments[tempVar[1]].p1,tempVar[2]);
			segmPointDist2=distBetweenPoints(handledPolygon.segments[tempVar[1]].p2,tempVar[2]);
			if(((segmPointDist1>minDistance)&&(segmPointDist2>minDistance))){
			//inserting the point in the segment-array
				handledPolygon.insertPoint(tempVar[2],tempVar[1]);//newPoint,index
			}
		}
	}	
}

function leftClickClosedMoveMode(handledPolygon,newlyClickedPoint){
	//if the clicked point is not to close to another point (not checking it self, there of the 4th argument in function call)
	if(checkIfCloseToPoint(handledPolygon.segments,newlyClickedPoint,minDistance,handledPolygon.movePointIndex)<0){
		//if the points nearest segments do not intersect with other segments
		if(document.getElementById("checkboxEnforceNonComplex").checked){
			if(!checkIfMovedIntersects(handledPolygon.segments,newlyClickedPoint,handledPolygon.movePointIndex)){
				//move the point at movePointIndex to the new point
				handledPolygon.segments[handledPolygon.movePointIndex].p1.copyValues(newlyClickedPoint); //copying values so that it is still the same object
				handledPolygon.moveMode=false;
			}
		}
		else{
			//move the point at movePointIndex to the new point
			handledPolygon.segments[handledPolygon.movePointIndex].p1.copyValues(newlyClickedPoint); //copying values so that it is still the same object
			handledPolygon.moveMode=false;		
		}
	}	
}

function leftClickOpen(handledPolygon,newlyClickedPoint){
	//check if this is the first segment
	if(handledPolygon.segments.length>0){
		//check if user clicks near the first point (wanting to close the polygon)
		if(distBetweenPoints(newlyClickedPoint,handledPolygon.segments[0].p1)<closePolygonMinimumDistance){
			//if the plygon already has at least 2 segments
			if(handledPolygon.segments.length>=2){
				//check that the segment between the last point and first point does not intersect with other segments
				var nyttSegment = new segment(handledPolygon.segments[handledPolygon.segments.length-1].p2,handledPolygon.segments[0].p1);
				if(document.getElementById("checkboxEnforceNonComplex").checked){
					if(!checkIfIntersect(handledPolygon.segments,nyttSegment,true)){
						handledPolygon.segments.push(nyttSegment);
						handledPolygon.close();
					}
				}
				else{
					handledPolygon.segments.push(nyttSegment);
					handledPolygon.close();				
				}
			}
		}
		else{
			//if the new segment does not intersect with other segments or the new point to close to other points, the add the point (+segment)
			var nyttSegment = new segment(handledPolygon.segments[handledPolygon.segments.length-1].p2,newlyClickedPoint);
			if(checkIfCloseToPoint(handledPolygon.segments,newlyClickedPoint,minDistance)<0){//checking p1 in all segments
				if(distBetweenPoints(handledPolygon.segments[handledPolygon.segments.length-1].p2,newlyClickedPoint)>minDistance){//checking p2 in the last segment
					if(document.getElementById("checkboxEnforceNonComplex").checked){
						if(!checkIfIntersect(handledPolygon.segments,nyttSegment,false)){
							handledPolygon.segments.push(nyttSegment);
						}
					}
					else{
						handledPolygon.segments.push(nyttSegment);				
					}
				}
			}
		}
	}
	else{//if seed does not exist (nor any other elements) Add the first point.
		if(!handledPolygon.seed){
			//console.log("first point");
			handledPolygon.seed=newlyClickedPoint;
		}
		else{
			//if it is not to close to the fist point, add the second point
			if(distBetweenPoints(handledPolygon.seed,newlyClickedPoint)>minDistance){
				//console.log("first segment");
				var nyttSegment = new segment(handledPolygon.seed,newlyClickedPoint);
				handledPolygon.segments.push(nyttSegment);
			}
		}
	}	
}

function rightClickOpen(handledPolygon){
	//removes last added point (+segment)
	if(handledPolygon.segments.length==0){
		handledPolygon.seed=false;
		//console.log("removed seed point");
	}
	handledPolygon.segments.pop();
}

function rightClickClosed(handledPolygon,newlyClickedPoint){
	//if the user rightclicked a point, remove it if there are more than 3 sides to the polygon
	var nearPointIndex=checkIfCloseToPoint(handledPolygon.segments,newlyClickedPoint,moveDelInsDistance);
	if(nearPointIndex>-1){
		//if polygon has more than 3 sides it is ok to remove point (+segment)
		if(handledPolygon.segments.length>3){
				//check that the segment created to fill the gap does not intersect with other segments
				if(document.getElementById("checkboxEnforceNonComplex").checked){
					if(!checkIfRemovedPointCausesSegmentIntersect(handledPolygon.segments,nearPointIndex)){
						//no intersects found
						handledPolygon.ejectPoint(nearPointIndex);
					}
				}
				else{
					handledPolygon.ejectPoint(nearPointIndex);				
				}
		}
	}
	//erase segment if user right clicked "on" segment
	else{
		//check if click was near segment
		var tempVar = checkIfCloseToLine(handledPolygon.segments,newlyClickedPoint,moveDelInsDistance);
		if(tempVar[0]){//true if user clicked close enough to segment
			//tempVar[1] holds what segment
			//Changing start segment so that the one to be removed is the last one
			handledPolygon.revolFirstIndex(tempVar[1]);
			//opening polygon and removing last segment
			handledPolygon.closed=false;
			handledPolygon.segments.pop();
		}
	}	
}

function rightClickClosedMoveMode(handledPolygon){
	//aborting move mode
	handledPolygon.moveMode=false;
	handledPolygon.movePointIndex=-1;
}

function checkIfRemovedPointCausesSegmentIntersect(segmentArrayIn,deleteAtIndex){
	//needs only to be checked for polygons with 5 sides or more
	//i.e. a four sided polygon loosing a side becomes a triangle, that can have no sides intersecting.
	if(segmentArrayIn.length>4){
		//find index for the segment one step prior
		var indexBeforeDeleteAtIndex=moduloInPolygon(deleteAtIndex-1,segmentArrayIn.length); //DAI-1
		//skapa ETT nya segment f�r valt index och det dessf�rrinnan
		//create ONE new segment to replace chosen segment (at deleteAtIndex) and the segment prior
		var thePotentialNewSegment = new segment(segmentArrayIn[indexBeforeDeleteAtIndex].p1,segmentArrayIn[deleteAtIndex].p2);
		//skipping the two segments to be replaced plus their neighbouring segments
		for(p=0;p<segmentArrayIn.length-4;p++){
			//drawOneSegment(segmentArrayIn[moduloInPolygon((p+deleteAtIndex+2),segmentArrayIn.length)],"0,0,255");
			segmentArrayIn[moduloInPolygon((p+deleteAtIndex+2),segmentArrayIn.length)]
			if(calculateIntersect(thePotentialNewSegment,segmentArrayIn[moduloInPolygon((p+deleteAtIndex+2),segmentArrayIn.length)])[0]){
				drawOneSegment(thePotentialNewSegment,"255,0,0");
				console.log("if that point is removed there will be an intersect");
				return true;
			}
		}
		//if coming this fara, there is no intersect found
		return false;
	}
	else{
		//if polygon had 4 sides or less, it is automatically OK
		return false;
	}
}

//checks if new point is too close to other points
//returning the nearest point or -1 if all points are outside minDistanceIn
//only checks with the first point in a segment. So when the polygon is not closed, the last point is not checked.
function checkIfCloseToPoint(segmentArrayIn,nyPunkt,minDistanceIn,skipPoint){
	//skipPoint is an optional parameter referensing the segment containing p1 not to be checked
	if (typeof skipPoint === 'undefined') { skipPoint = -1; }
	var localMinDistance=minDistanceIn;
	var isTooClose = -1;
	var pointDistance=0;
	for(i=0;i<segmentArrayIn.length;i++){
		if(i==skipPoint){continue;}
		//calculating distance between new point and all other points in polygon
		pointDistance=distBetweenPoints(segmentArrayIn[i].p1,nyPunkt);
		if(pointDistance<localMinDistance){
			//if it is closer than minDistanceIn, or nearer than any other previously saved, it is saved
			isTooClose = i;
			localMinDistance=pointDistance;
		}
	}
	return isTooClose;
}

//checking if new point is near other polygon segments
function checkIfCloseToLine(segmentArrayIn,nyPunkt,minDistanceIn){
	var distToLine=-1;
	var smallestDistance=minDistanceIn;
	var ppReturArray = new Array();
	var closeEnough=false;
	var firstPointIndex = 0;
	var closestPoint = new point();
	//checking with every segment
	for(j=0;j<segmentArrayIn.length;j++){
		//projecting point on segment
		var proj_svar=project_vector(segmentArrayIn[j],nyPunkt);
		var distToLine=proj_svar[0]; //negative if it is too far away
		var projPunkten = proj_svar[1];   //0 if it is too far away
		//if it was between 0 and minDistanceIn
		if(distToLine>=0&&distToLine<minDistanceIn){
			if(distToLine<smallestDistance){
				//if it is closer than minDistanceIn and closer than last saved, it is saved
				smallestDistance=distToLine; 
				closestPoint=projPunkten;
				firstPointIndex=j;
			}
			closeEnough = true;
		}
	}
	ppReturArray.push(closeEnough); //true, if there was anything close enough
	ppReturArray.push(firstPointIndex); //index for the first point on segment clicked (index for the segment clicked?)
	ppReturArray.push(closestPoint); //the point projected on the segment
	return ppReturArray;
}

//checking if new segment intersects with other segment in array
function checkIfIntersect(segmentArrayIn,nyttSegmentIn,skipFirstSegment){
	var startSegm=0;
	if(skipFirstSegment){startSegm=1;}//skipping first segment in case user clicks the polygons first point
	//skipping the second to last (penultimate segment)
	for(n=startSegm;n<segmentArrayIn.length-1;n++){
		result=calculateIntersect(segmentArrayIn[n],nyttSegmentIn);
		if(result[0]){
			//returning true if there is a intersect
			return true;
		}
	}
	//arriving here, there is no intersect
	return false;
}

//checking if the two segments containing a point (being moved) intersects with the other segments in a polygon (at move)
function checkIfMovedIntersects(segmentArrayIn,nyPunkt,movedAtIndex){
	// if polygon has more than 3 segments, otherwise return false
	if(segmentArrayIn.length>3){
		//find index for segments two steps before, one step before and one step after chosen index
		//MAI ~ Move At Index
		var indexBeforeMovedAtIndex=moduloInPolygon(movedAtIndex-1,segmentArrayIn.length); //MAI-1
		var indexBeforeBeforeMovedAtIndex=moduloInPolygon(indexBeforeMovedAtIndex-1,segmentArrayIn.length);//MAI-2
		var indexAfterMovedAtIndex=moduloInPolygon(movedAtIndex+1,segmentArrayIn.length);//MAI+1
		//creating two new segments for chosen index and the one prior
		var firstCheckedSegment  = new segment(segmentArrayIn[indexBeforeMovedAtIndex].p1,nyPunkt);
		var secondCheckedSegment = new segment(nyPunkt,segmentArrayIn[movedAtIndex].p2);
		//loop through all segments in segment array
		//general idea: no need to check if neighbouring segments intersect with current segment (being checked)
		for(m=0;m<segmentArrayIn.length;m++){
			//skip the two unnecessary segments for both comparisons (lying next to both segments)
			if(m==movedAtIndex||m==indexBeforeMovedAtIndex){continue;} //MAI & MAI-1
			//skip the segment before firstCheckedSegment
			if(m!==indexBeforeBeforeMovedAtIndex){ //MAI-2
				//checking if firstCheckedSegment intersects with any of the other interesting segments
				if(calculateIntersect(firstCheckedSegment,segmentArrayIn[m])[0]){return true}
			}
			//skip the segment after secondCheckedSegment
			if(m!==indexAfterMovedAtIndex){ //MAI+1
				//checking if secondCheckedSegment intersects with any of the other interesting segments
				if(calculateIntersect(secondCheckedSegment,segmentArrayIn[m])[0]){return true}
			}
		}
		//if arriving here, there are no intersects
		return false;
	}
	else{
		//if the polygon had only 3 sides, it is automatically ok
		return false;
	}
}

//*************************
//** Objects             **
//*************************
//----------------------------------------------------------------
//---POLYGON------------------------------------------------------
//polygon object constructor
function polygon(){
	this.segments = new Array();
	this.closed = false;
	this.clockWise = false;
	this.area = 0;
	this.seed=false;
	this.moveMode=false;
	this.movePointIndex=-1;
	
	//methods
	this.close=close;
	this.insertPoint=insertPoint;
	this.ejectPoint=ejectPoint;
	this.reversePolygon=reversePolygon;
	this.gShoeLace=gShoeLace;
	this.revolFirstIndex=revolFirstIndex;
}

//closing polygon
function close(){
	this.closed=true;
}

//changing direction of polygon (clockwise <-> counter clockwise)
function reversePolygon(){
	this.segments.reverse();
	//the direction of all segments in polygon must also be reversed
	for(u=0;u<this.segments.length;u++){
		this.segments[u].reverseSegment();
	}
}

//inserting a new point (+segment) in a polygon segment array, at a given index
function insertPoint(newPointIn,insertAtThisIndex){
//splitting a segment (A-B) that is given a new point
//the new segment goes from breakPoint to point B
//the old segment is changed so that it goes from point A to the breakPoint
	//new segment starts at the breaking point, ends where the divided segment ended (B)
	var tempSegmentToInsert = new segment(newPointIn,this.segments[insertAtThisIndex].p2);
	//add new segment after the break
	this.segments.splice(insertAtThisIndex+1,0,tempSegmentToInsert);
	//chagning segment before the break so that the end point is now the breakPoint
	this.segments[insertAtThisIndex].p2=newPointIn;
}

//calculating area and checking if polygon is drawn clockwise or not
function gShoeLace(){
	//using the Gauss shoelace formula
	//http://en.wikipedia.org/wiki/Shoelace_formula
	if(this.closed){
		var theSum=0;
		for(b=0;b<this.segments.length;b++){
			theSum+=this.segments[b].p1.x*this.segments[b].p2.y-this.segments[b].p1.y*this.segments[b].p2.x;
		}
		this.area=theSum/2;
		//see also http://en.wikipedia.org/wiki/Curve_orientation
		if(this.area>0){
			this.clockWise=true;
		}
		else{
			this.clockWise=false;
		}
	}
}

//changing the starting point in the polygon (i.e. chaing what segment is the starting segment)
function revolFirstIndex(newFirstIndex){
	if(this.closed){
		//handling if newFirstIndex is larger than the number of segments
		newFirstIndex=moduloInPolygon(newFirstIndex,this.segments.length);
		//removing the group of segments (up until newfirstindex)
		var tempArray = this.segments.splice(0,newFirstIndex+1);
		//l�gger den stumpen p� slutet
		//adding the group of segments to the end of the other part
		this.segments=this.segments.concat(tempArray);
		//changing the polygon seed point to the first point
		this.seed=this.segments[0].p1;
	}
}

//removing a point (+segment) from a polygon segment-array, at a given index
function ejectPoint(removeAtThisIndex){
	//the point to be removed is the first point in the segment with index=removeAtThisIndex
	//the index for the segment prior to the segment removed (handled if removeAtThisIndex==0)
	indexBeforeRemoveAtThisIndex=moduloInPolygon((removeAtThisIndex-1),this.segments.length);
	//changing the "second point in the prior segment" to the second point in the segment to be removed
	this.segments[indexBeforeRemoveAtThisIndex].p2=this.segments[removeAtThisIndex].p2;
	//removing the segment
	this.segments.splice(removeAtThisIndex,1);
}

//----------------------------------------------------------------
//---SEGMENT------------------------------------------------------
//segment object constructor
function segment(punkt1,punkt2){
	this.p1=punkt1;
	this.p2=punkt2;
	//TODO error handling if punkt1 and punkt2 are not given or not point objects
	this.cLength=0; //calculated length
	this.calculateLength=calculateLength;
	this.reverseSegment=reverseSegment;
}

//the lenght of a segment
//TODO check if it is used (could be used to calculate polygon perimeter length)
function calculateLength(){
	var segmentLength=Math.sqrt(Math.pow((this.p1.x-this.p2.x),2)+Math.pow((this.p1.y-this.p2.y),2));
	this.cLength=segmentLength; //save
	return segmentLength;
}

//chance the direction of segment
function reverseSegment(){
	var tempReversePoint=this.p1;
	this.p1=this.p2;
	this.p2=tempReversePoint;
}

//----------------------------------------------------------------
//---VECTOR-------------------------------------------------------
//vector object constructor
function vector(punkt1,punkt2){
	if(punkt1==undefined||punkt2==undefined){this.x=0;this.y=0;}
	else{this.x=punkt2.x-punkt1.x;this.y=punkt2.y-punkt1.y;}
	this.vLength=vLength;
}

//calculate lenght of a vector
function vLength(){
	return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2));
}

//calculate the dot product between to vectors
function dotProduct(vector1,vector2){
	return (vector1.x*vector2.x+vector1.y*vector2.y);
}

//----------------------------------------------------------------
//--POINT---------------------------------------------------------
//point object constructor
function point(x,y){
	if(x==undefined||y==undefined){
		x=0;
		y=0
	}
	else{
		this.x=x;
		this.y=y;
	}
	this.rotate=rotate;
	this.translate=translate;
	this.getTheAngle=getTheAngle;
	this.clonePoint=clonePoint;
	this.copyValues=copyValues;
}

//copying values from point so that the new point IS the same object
function copyValues(copyFromThisPoint){
	this.x=copyFromThisPoint.x;
	this.y=copyFromThisPoint.y;
}

//clone a point
function clonePoint(){
	var copiedPoint = new point(this.x,this.y);
	return copiedPoint;
}

//rotate a point around the Origin
function rotate(vinkel){
	var tempX=this.x
	var tempY=this.y;
	this.x= tempX*Math.cos(vinkel)+tempY*Math.sin(vinkel);
	this.y=-tempX*Math.sin(vinkel)+tempY*Math.cos(vinkel);
}

//move a point
function translate(distX,distY){
	this.x+=distX;
	this.y+=distY;
}

//return the angle between the x-axis and a vector AB (where A is in the Origin and B is the point checked)
function getTheAngle(){
	arctanAngle=Math.atan(this.y/this.x);
	if(this.y>0){
		//if the point is in q1
		if(this.x>=0){return arctanAngle}
		//if the point is in q2
		else{return (Math.PI+arctanAngle)}
	}
	else{
		//if the point is in q3
		if(this.x<0){return (Math.PI+arctanAngle)}
		//if the point is in q4
		else{return (2*Math.PI+arctanAngle)}
	}
}

