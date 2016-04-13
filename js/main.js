window.onload = function(){
	var code, move, reset, sample, bezier, time, out, outputCode, width, height, offHeight, mainWidth, mainHeight;
	var localStorage = window.localStorage;
	canvas = document.getElementById("canvas");
	code = document.getElementById("code");
	move = document.getElementById("move");
	reset = document.getElementById("reset");
	sample = document.getElementById("sample");
	time = document.getElementById("time");
	out = document.getElementById("out");
	cp1x = document.getElementById("cp1x");
	cp1y = document.getElementById("cp1y");
	cp2x = document.getElementById("cp2x");
	cp2y = document.getElementById("cp2y");
	save = document.getElementById("save");
	output = document.getElementById("output");
	outputCode = document.getElementsByClassName("output-code");
	closeBtn = document.getElementsByClassName("close");
	width = canvas.width;
	height = canvas.height;
	offHeight = 0.25*height;
	mainHeight = 0.5*height;
	


	//绑定按钮以及手动输入控件的事件
	reset.onmousedown=function(){
		this.style.transform="translate(0,5px)";
		this.style.boxShadow="0 1px #5A687F";
	}
	reset.onmouseup=function(){
		Canvas.init();
		this.style.transform="translate(0,0)";
		this.style.boxShadow="0 5px #5A687F";
		cp1x.value=cp1y.value=cp2x.value=cp2y.value="";
		time.value=1;
		out.value="1s";
		(function(){
			sample.style.transition="all 0.5s";
			sample.style.left="0px";
		})()
	}
	move.onmousedown=function(){
		this.style.transform="translate(0,5px)";
		this.style.boxShadow="0 1px #5A687F";
		sample.style.transition="all "+Canvas.trans+"s cubic-bezier("+Canvas.bezier.cp1.x+","+Canvas.bezier.cp1.y+","+Canvas.bezier.cp2.x+","+Canvas.bezier.cp2.y+")";
		sample.style.transition=Canvas.trans;
	}
	move.onmouseup=function(){
		this.style.transform="translate(0,0)";
		this.style.boxShadow="0 5px #5A687F";

		if(sample.style.left=="100%"){
			sample.style.left="0%";
		}else{
			sample.style.left="100%";
		}
	}
	time.onchange=function(){
		Canvas.trans= time.value;
		out.innerHTML=Canvas.trans+"s";
		Canvas.draw();
	}
	cp1x.onchange=function(){
		Canvas.point.cPoint.cp1.x = cp1x.value*width;
		Canvas.draw();
	}
	cp1y.onchange=function(){
		Canvas.point.cPoint.cp1.y = (1-cp1y.value)*mainHeight+offHeight;
		Canvas.draw();
	}
	cp2x.onchange=function(){
		Canvas.point.cPoint.cp2.x = cp2x.value*width;
		Canvas.draw();
	}
	cp2y.onchange=function(){
		Canvas.point.cPoint.cp2.y = (1-cp2y.value)*mainHeight+offHeight;
		Canvas.draw();
	}
	save.onmousedown=function(){
		this.style.transform="translate(0,5px)";
		this.style.boxShadow="0 1px #5A687F";
	}
	save.onmouseup=function(){
		this.style.transform="translate(0,0)";
		this.style.boxShadow="0 5px #5A687F";

		var saveName = prompt("Give it a name!").toString();
		if(saveName){
			var bezierCor = appendOutput(saveName);
			var saveObj = JSON.stringify({
				className:"output-code",
				id:saveName,
				innerHTML:saveName+"<button class=\"close\">x</button>",
				outputCode:"transition: all "+Canvas.trans+"s cubic-bezier("+bezierCor+");\n"+
				"-webkit-transition: all "+Canvas.trans+"s cubic-bezier("+bezierCor+");"
			});
			localStorage.setItem(saveName,saveObj); 
		}
	}
	Canvas.init();
	processSavedCode();
	checkStorage();

	/**
	 * output中，已有的代码选择效果，以及删除效果
	 */
	function processSavedCode(){
		for(var i=0;i<outputCode.length;i++){
			outputCode[i].onclick=function(){
				for(var i=0;i<outputCode.length;i++){
					outputCode[i].style.backgroundColor = "";
				}
				this.style.backgroundColor = "#FF5800";
				var beziervalue = this.attributes["data-bezier"].value.split(",");
				//改变坐标
				Canvas.point.cPoint.cp1.x = beziervalue[0]*width;
				Canvas.point.cPoint.cp1.y = (1-beziervalue[1])*mainHeight+offHeight;
				Canvas.point.cPoint.cp2.x = beziervalue[2]*width;
				Canvas.point.cPoint.cp2.y = (1-beziervalue[3])*mainHeight+offHeight;
				Canvas.draw();
			}
			closeBtn[i].onclick=function(e){
				e.stopPropagation();
				if(confirm("你确定想要删除 "+ this.parentNode.id +" ?")){
					output.removeChild(this.parentNode);
					if(confirm("同时删除本地存储么？")){
						localStorage.removeItem(this.parentNode.id);
					}
				}
			}	
		}
	}
	/**
	 * 在output中插入子元素--保存的代码
	 * @param  {[str]} name [保存代码的名称]
	 * @return {[str]}      [保存代码的贝塞尔坐标]
	 */
	function appendOutput(name){
		var newNode = document.createElement("div");
		newNode.className = "output-code";
		newNode.id = name;
		newNode.innerHTML = newNode.id+"<button class=\"close\">x</button>"
		
		newNode.dataset.bezier = Canvas.bezier.cp1.x+","+Canvas.bezier.cp1.y+","+Canvas.bezier.cp2.x+","+Canvas.bezier.cp2.y;
		output.appendChild(newNode);
		outputCode = document.getElementsByClassName("output-code");
		closeBtn = document.getElementsByClassName("close");
		processSavedCode();
		return newNode.dataset.bezier;
	}
	/**
	 * 检查本地存储有没有用户定义的代码
	 */
	function checkStorage(){
		if(localStorage.length){
			for(var i =0,len = localStorage.length;i<len;i++){
				var itemKey = localStorage.key(i);
				var itemValue = JSON.parse(localStorage.getItem(itemKey));
				appendOutput(itemValue.id);
			}
		}
	}
}