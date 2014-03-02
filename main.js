

	function init() {
		var canvas = document.getElementById("canvas");
		IWIDTH=canvas.width;
		IHEIGHT=canvas.height;
			if (canvas.getContext) {
			ctx = canvas.getContext("2d");
		}
		
	}

	function rensaHelt(){
		firstPolygon.segments=[];
		firstPolygon.closed=false;
		firstPolygon.seed=false;
		clearTheCanvas();
		
		//AP radera alla polygoner
	}

	function handleClick(isLeftClick,nyKlickadPunkt){
		hanteradPolygon=firstPolygon;
		if(isLeftClick){
			if(hanteradPolygon.closed){
				if(hanteradPolygon.moveMode){leftClickClosedMoveMode(hanteradPolygon,nyKlickadPunkt)}//LEFT - CLOSED - MOVEMODE
				else{leftClickClosed(hanteradPolygon,nyKlickadPunkt)}//LEFT - CLOSED
			}
			else{leftClickOpen(hanteradPolygon,nyKlickadPunkt)}//LEFT - OPEN
		}
		else{
			if(hanteradPolygon.closed){
				if(hanteradPolygon.moveMode){rightClickClosedMoveMode(hanteradPolygon)}//RIGHT - CLOSED - MOVEMODE
				else{rightClickClosed(hanteradPolygon,nyKlickadPunkt)}//RIGHT - CLOSED
			}
			else{rightClickOpen(hanteradPolygon)}//RIGHT - OPEN
		}
		
		hanteradPolygon.gShoeLace();
		drawPolygon(hanteradPolygon);
	}

	function leftClickClosed(hanteradPolygon,nyKlickadPunkt){
		var nearPointIndex=checkIfCloseToPoint(hanteradPolygon.segments,nyKlickadPunkt,minDistance);
		if(nearPointIndex>-1){
			hanteradPolygon.moveMode=true;
			hanteradPolygon.movePointIndex=nearPointIndex;
		}
		else{
			//om klickningen �r n�ra linje, s�tt in ny punkt
			var tempVar = checkIfCloseToLine(hanteradPolygon.segments,nyKlickadPunkt,minDistance);
			if(tempVar[0]){
				//avrundar ev koordinaterna f�r att f� heltal
				if(useIntegerCoords){
					tempVar[2].x=Math.round(tempVar[2].x);
					tempVar[2].y=Math.round(tempVar[2].y);
				}
				//l�gger till ny punkt inne i segment-arrayen
				hanteradPolygon.insertPoint(tempVar[2],tempVar[1]);//newPoint,index
			}
		}	
	}
	
	function leftClickClosedMoveMode(hanteradPolygon,nyKlickadPunkt){
		//om punkten inte �r f�r n�ra n�n annan
		if(checkIfCloseToPoint(hanteradPolygon.segments,nyKlickadPunkt,minDistance)<0){
			//om punktens n�rmaste linjesegment inte sk�r n�t annat segment
			if(!checkIfMovedIntersects(hanteradPolygon.segments,nyKlickadPunkt,hanteradPolygon.movePointIndex)){
				//flytta movePointIndex till nya punkten
				hanteradPolygon.segments[hanteradPolygon.movePointIndex].p1.copyValues(nyKlickadPunkt); //kopierar v�rdena f�r att det fortfarande ska vara samma objekt
				hanteradPolygon.moveMode=false;
			}
		}	
	}

	function leftClickOpen(hanteradPolygon,nyKlickadPunkt){
		//�r det f�rsta segmentet eller?
		if(hanteradPolygon.segments.length>0){
			//klickar anv�ndaren n�ra f�rsta punkten?
			if(distBetweenPoints(nyKlickadPunkt,hanteradPolygon.segments[0].p1)<closePolygonMinimumDistance){
				//om polygonen har minst 2 segment redan
				if(hanteradPolygon.segments.length>=2){
					//kolla att segmentet mellan sista punkten och f�rsta punkten inte sk�r n�n linje
					var nyttSegment = new segment(hanteradPolygon.segments[hanteradPolygon.segments.length-1].p2,hanteradPolygon.segments[0].p1);
					if(!checkIfIntersect(hanteradPolygon.segments,nyttSegment,true)){
						hanteradPolygon.segments.push(nyttSegment);
						hanteradPolygon.close();
					}
				}
			}
			else{
				//om linjen inte sk�r n�n annan linje, eller �r f�r n�ra n�n punkt s� l�gg till punkten
				console.log("antal segment"+hanteradPolygon.segments.length);
				var nyttSegment = new segment(hanteradPolygon.segments[hanteradPolygon.segments.length-1].p2,nyKlickadPunkt);
				if(!checkIfIntersect(hanteradPolygon.segments,nyttSegment,false)){
					if(checkIfCloseToPoint(hanteradPolygon.segments,nyKlickadPunkt,minDistance)<0){
						hanteradPolygon.segments.push(nyttSegment);
					}
				}
			}
		}
		else{//om seed eller n�gra segment �nnu inte finns
			if(!hanteradPolygon.seed){
				console.log("f�rsta punkten");
				hanteradPolygon.seed=nyKlickadPunkt;
			}
			else{
				//om den inte �r f�r n�ra f�rsta punkten
				if(checkIfCloseToPoint(hanteradPolygon.seed,nyKlickadPunkt,minDistance)<0){
					console.log("f�rsta segmentet");
					var nyttSegment = new segment(hanteradPolygon.seed,nyKlickadPunkt);
					hanteradPolygon.segments.push(nyttSegment);
				}
			}
		}	
	}
	
	function rightClickOpen(hanteradPolygon){
		//ta bort senaste inmatade punkten
		if(hanteradPolygon.segments.length==0){
			hanteradPolygon.seed=false;
			console.log("tog bort seed");
		}
		hanteradPolygon.segments.pop();
		console.log("segment kvar"+hanteradPolygon.segments.length);		
	}
	
	function rightClickClosed(hanteradPolygon,nyKlickadPunkt){
		//Om det �r p� en punkt, ta bort den om det �r fler �n tre punkter totalt
		var nearPointIndex=checkIfCloseToPoint(hanteradPolygon.segments,nyKlickadPunkt,minDistance);
		if(nearPointIndex>-1){
			//om polygonen har fler �n tre sidor g�r det ta bort en punkt
			if(hanteradPolygon.segments.length>3){
				//plocka ut den valda punkten
				hanteradPolygon.ejectPoint(nearPointIndex);
			}
		}
		//radera element om h�gerklicka p� p� segment
		else{
			//om klickningen �r n�ra linje, s�tt in ny punkt
			var tempVar = checkIfCloseToLine(hanteradPolygon.segments,nyKlickadPunkt,minDistance);
			if(tempVar[0]){//true om det klickades tillr�ckligt n�ra ett segment
				//tempVar[1] ber�ttar vilket segment
				//flyttar startpunkten
				hanteradPolygon.revolFirstIndex(tempVar[1]);
				//�ppnar polygonen och tar bort sista elementet
				hanteradPolygon.closed=false;
				hanteradPolygon.segments.pop();
			}
		}	
	}
	
	function rightClickClosedMoveMode(hanteradPolygon){
		//Avbryter "flyttl�ge"
		hanteradPolygon.moveMode=false;
		hanteradPolygon.movePointIndex=-1;
	}
	
	
	

	//---------------------------------------------------------------------
	//*************************
	//********objekt***********

	//---polygon---------------------------
	function polygon(){
		this.segments = new Array();
		this.closed = false;
		this.clockWise = false;
		this.area = 0;
		this.seed=false;
		this.moveMode=false;
		this.movePointIndex=-1;
		
		//angr�nsar till vilka grannar, vid vilket segment
		//metod f�r att st�nga polygon
		//metod f�r att flytta punkt?
		
		//metoder
		this.close=close;
		this.insertPoint=insertPoint;
		this.ejectPoint=ejectPoint;
		this.reversePolygon=reversePolygon;
		this.gShoeLace=gShoeLace;
		this.revolFirstIndex=revolFirstIndex;
	}

	//st�nger polygonen
	function close(){
		this.closed=true;
		//ber�knar arean och kollar om den �r ritad medurs eller moturs
		this.gShoeLace();
		//om den �r moturs 
		if(!this.clockWise&&document.getElementById("checkboxEnforceClockwise").checked){
			this.reversePolygon();
		}
	}
