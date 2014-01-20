var scrollerObj = new Scroller(function(left, top, zoom) {
    // apply coordinates/zooming
}, {
	zooming: true,
	locking: false,
	bouncing: false,
	animating: false,
	minZoom: 1,
	maxZoom: 10
});

var canvas, ctx, mousedown=false;

function prepareCanvas(){
	canvas=document.getElementById("canvas");
	canvas.onselectstart = function () { return false; }
	canvas.setAttribute('width', canvasSize);
	canvas.setAttribute('height', canvasSize);
	canvas.style.width="800px";
	canvas.style.height="800px";
	ctx=canvas.getContext("2d");
	
	scrollerObj.setDimensions(800, 800, 800, 800);
	scrollerObj.setPosition($('canvas').position().left, $('canvas').position().top);

	canvas.addEventListener("mousedown", function(e) {
		scrollerObj.doTouchStart([{pageX: e.pageX,pageY: e.pageY}], e.timeStamp);
		mousedown = true;
		redraw();
	}, false);

	canvas.addEventListener("mousemove", function(e) {
		if (!mousedown) {return;}
		scrollerObj.doTouchMove([{pageX: e.pageX,pageY: e.pageY}], e.timeStamp);
		mousedown = true;
		redraw();
	}, false);

	canvas.addEventListener("mouseup", function(e) {
		if (!mousedown) {return;}
		scrollerObj.doTouchEnd(e.timeStamp);
		mousedown = false;
		redraw();
	}, false);
	
};

function resetZoom(){
	scrollerObj.zoomTo(1);
}

function getMouse(e){
	var mouseX = e.pageX-$('canvas').position().left, mouseY = e.pageY-$('canvas').position().top;
	var data=scrollerObj.getValues();
	mouseX=(data.left+mouseX)*canvasScale/data.zoom, mouseY=(data.top+mouseY)*canvasScale/data.zoom;
	return {x:mouseX, y:mouseY};
}

$('canvas').mousewheel(function(e, delta, deltaX, deltaY){
	if(selectedCircle != -1) return;
	scrollerObj.doMouseZoom(-delta*3, e.timeStamp, e.pageX, e.pageY);
	redraw();
	return false;
})

$(document).on("contextmenu", "canvas", function(e){
   snapMode=!snapMode;
   return false;
});

function createFinalImage(){
	dirtyRender=0;
	redraw();
	var imgData=ctx.getImageData(0,0,canvasSize,canvasSize);
	for (var i=0;i<imgData.data.length;i+=4)
		if(imgData.data[i]==255 && imgData.data[i+1]==255 && imgData.data[i+2]==255) imgData.data[i+3]=0;	//converts white to transparency
	ctx.putImageData(imgData,0,0);
	var dataURL = canvas.toDataURL();
	window.open(dataURL);
	dirtyRender=1;
	redraw();
	return;
}