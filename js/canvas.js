(function(){
	var Canvas={}, canvas, ctx, code, style, drag = null, width, height, offHeight, mainHeight;
	canvas = document.getElementById("canvas");
	code = document.getElementById("code");
	ctx = canvas.getContext("2d");
	width = canvas.width;
	height = canvas.height;
	offHeight = 0.25*height;
	mainHeight = 0.5*height;

	/**
	 * 初始化画布，包括控制点位置，线条样式
	 */
	Canvas.init = function() {
		Canvas.trans=1;
		Canvas.point = {
			p1: { x:0, y:mainHeight+offHeight },
			p2: { x:width, y:offHeight },
			cPoint:{
				cp1: { x:0.25*width, y:0.5*mainHeight+offHeight },
				cp2: { x:0.75*width, y:0.5*mainHeight+offHeight },
			}
		};
	
		// 默认样式
		style = {
			curve:	{ width: 6, color: "#333" },
			cpline:	{ width: 2, color: "#435055" },
			point: { radius: 14, width: 2, color: "#27323A", fill: "rgba(200,200,200,0.5)",fillc1: "rgba(255,87,34,0.5)",fillc2: "rgba(0,173,181,0.5)", arc1: 0, arc2: 2 * Math.PI }
		}
		
		// 线条样式
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		// 绑定事件
		canvas.onmousedown = DragStart;
		canvas.onmousemove = Dragging;
		canvas.onmouseup = canvas.onmouseout = DragEnd;
		
		Canvas.draw();
	}
	
	/**
	 * 绘制canvas,包括：坐标范围、2条控制线、1条贝塞尔曲线、2个起始点、2个控制点
	 */
	Canvas.draw = function() {
		ctx.clearRect(0, 0, width, height);

		//绘制坐标轴
		ctx.lineWidth = 4;
		ctx.fillStyle="#FFF1B6";
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(0,offHeight+mainHeight);
		ctx.lineTo(0,offHeight);
		ctx.lineTo(width,offHeight);
		ctx.lineTo(width,offHeight+mainHeight);
		ctx.lineTo(0,offHeight+mainHeight);
		ctx.stroke();
		ctx.fill()

		// 绘制控制线格式
		ctx.lineWidth = style.cpline.width;
		ctx.strokeStyle = style.cpline.color;
		//控制点1的线
		ctx.beginPath();
		ctx.moveTo(Canvas.point.p1.x, Canvas.point.p1.y);
		ctx.lineTo(Canvas.point.cPoint.cp1.x, Canvas.point.cPoint.cp1.y);
		//控制点2的线
		ctx.moveTo(Canvas.point.p2.x, Canvas.point.p2.y);
		ctx.lineTo(Canvas.point.cPoint.cp2.x, Canvas.point.cPoint.cp2.y);
		ctx.stroke();
		
		// 绘制贝塞尔曲线
		ctx.lineWidth = style.curve.width;
		ctx.strokeStyle = style.curve.color;
		ctx.beginPath();
		ctx.moveTo(Canvas.point.p1.x, Canvas.point.p1.y);
		ctx.bezierCurveTo(Canvas.point.cPoint.cp1.x, Canvas.point.cPoint.cp1.y, Canvas.point.cPoint.cp2.x, Canvas.point.cPoint.cp2.y, Canvas.point.p2.x, Canvas.point.p2.y);
		ctx.stroke();

		// 绘制起点与终点
		ctx.lineWidth = style.point.width;
		ctx.strokeStyle = style.point.color;
		ctx.fillStyle = style.point.fill;
		//起点
		ctx.beginPath();
		ctx.arc(Canvas.point.p1.x, Canvas.point.p1.y, style.point.radius, style.point.arc1, style.point.arc2, true);
		ctx.fill();
		ctx.stroke();
		//终点
		ctx.beginPath();
		ctx.arc(Canvas.point.p2.x, Canvas.point.p2.y, style.point.radius, style.point.arc1, style.point.arc2, true);
		ctx.fill();
		ctx.stroke();

		// 绘制两个控制点
		//控制点1
		ctx.fillStyle = style.point.fillc1;
		ctx.beginPath();
		ctx.arc(Canvas.point.cPoint.cp1.x, Canvas.point.cPoint.cp1.y, style.point.radius, style.point.arc1, style.point.arc2, true);
		ctx.fill();
		ctx.stroke();
		//控制点2
		ctx.fillStyle = style.point.fillc2;
		ctx.beginPath();
		ctx.arc(Canvas.point.cPoint.cp2.x, Canvas.point.cPoint.cp2.y, style.point.radius, style.point.arc1, style.point.arc2, true);
		ctx.fill();
		ctx.stroke();
		
		Canvas.showCode();
	}
	
	/**
	 * 改变画布坐标，显示代码
	 */
	Canvas.showCode = function() {
		Canvas.bezier={
			cp1:{
				x:((Canvas.point.cPoint.cp1.x)/width).toFixed(2),
				y:((mainHeight-Canvas.point.cPoint.cp1.y+offHeight)/mainHeight).toFixed(2),
			},
			cp2:{
				x:((Canvas.point.cPoint.cp2.x)/width).toFixed(2),
				y:((mainHeight-Canvas.point.cPoint.cp2.y+offHeight)/mainHeight).toFixed(2),
			}
		};
		if (code) {
			code.innerHTML = 
				"<p>transition: all "+Canvas.trans+"s cubic-bezier("+Canvas.bezier.cp1.x+", "+Canvas.bezier.cp1.y+", "+Canvas.bezier.cp2.x+", "+Canvas.bezier.cp2.y+");</p>"+
				"<p>-webkit-transition: all "+Canvas.trans+"s cubic-bezier("+Canvas.bezier.cp1.x+", "+Canvas.bezier.cp1.y+", "+Canvas.bezier.cp2.x+", "+Canvas.bezier.cp2.y+");</p>"+
				"<p>-moz-transition: all "+Canvas.trans+"s cubic-bezier("+Canvas.bezier.cp1.x+", "+Canvas.bezier.cp1.y+", "+Canvas.bezier.cp2.x+", "+Canvas.bezier.cp2.y+");</p>"+
				"<p>-o-transition: all "+Canvas.trans+"s cubic-bezier("+Canvas.bezier.cp1.x+", "+Canvas.bezier.cp1.y+", "+Canvas.bezier.cp2.x+", "+Canvas.bezier.cp2.y+");</p>"
				;
		}
	}
	
	
	/**
	 * 开始拖拽，判断点击的控制点，并给drag标志位赋值
	 * @param {[type]} e [description]
	 */
	function DragStart(e) {
		e = MousePos(e);
		var dx, dy;
		//遍历2个控制点，判断点击的哪一个
		for (var p in Canvas.point.cPoint) {
			dx = Canvas.point.cPoint[p].x - e.x;
			dy = Canvas.point.cPoint[p].y - e.y;
			if ((dx * dx) + (dy * dy) < style.point.radius * style.point.radius) {
				drag = p;
				dPoint = e;
				canvas.style.cursor = "move";
				return;
			}
		}
	}
	
	
	/**
	 * 拖拽中，获得鼠标从开始拖拽时产生的位移，将其加在总之点的坐标上，
	 * @param {[type]} e [description]
	 */
	function Dragging(e) {
		if (drag) {
			e = MousePos(e);
			Canvas.point.cPoint[drag].x += e.x - dPoint.x;
			Canvas.point.cPoint[drag].y += e.y - dPoint.y;
			dPoint = e;
			Canvas.draw();
		}
	}
	
	
	/**
	 * 拖拽结束后，清空drag标志位，并绘制canvas
	 */
	function DragEnd() {
		drag = null;
		canvas.style.cursor = "default";
		Canvas.draw();
	}

	
	/**
	 * 获取鼠标在画布上的坐标
	 * @param {[eventObj]} event 
	 * @return {[Object]} 包含此时鼠标所在的x,y坐标 
	 */
	function MousePos(event) {
		event = (event ? event : window.event);
		return {
			x: event.pageX - canvas.offsetLeft,
			y: event.pageY - canvas.offsetTop
		}
	}

	window.Canvas = Canvas;

})()