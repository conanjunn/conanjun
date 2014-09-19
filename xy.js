var ClassXy = function(str, oParent) {
	this.elements = [];
	this.queueJson=[];
	if ((typeof str).toLowerCase() === "string") {
		switch (str.charAt(0)) {
			case '#':
				var sTmp = str.substring(1);
				this.elements.push(document.getElementById(sTmp));
				break;
			case '.':
				var sTmp = str.substring(1);
				var obj = oParent || document;
				if (obj.getElementsByClassName) {
					xy.appendArr(this.elements, obj.getElementsByClassName(sTmp));
				} else {
					var arr = [];
					var aChild = obj.getElementsByTagName('*');
					var re = new RegExp('\\b' + sTmp + '\\b', 'i');
					for (var i = 0; i < aChild.length; i++) {
						if (re.test(aChild[i].className)) {
							arr.push(aChild[i]);
						}
					}
					xy.appendArr(this.elements, arr);
				}
				break;
			case '!':
				var sTmp = str.substring(1);
				xy.appendArr(this.elements, document.getElementsByName(sTmp));
				break;
			case '<':
				var oDiv = document.createElement("div");
				oDiv.innerHTML = str;
				this.elements=oDiv.children;
				break;
			default:
				var obj = oParent || document;
				xy.appendArr(this.elements, obj.getElementsByTagName(str));
		}
	} else if ((typeof str).toLowerCase() === "object") {
		this.elements.push(str);
	} else if ((typeof str).toLowerCase() === "function") {
		var oldonload = window.onload;
		if (typeof window.onload != "function") {
			window.onload = str;
		} else {
			window.onload = function() {
				oldonload();
				str();
			}
		}
	}
};


window.xy = function(str, oParent) {
	return new ClassXy(str, oParent);
};
xy.getId = function(sId) {
	return document.getElementById(sId);
};
xy.getTag = function(sTag, oParent) {
	oParent = oParent || document;
	return oParent.getElementsByName(sTag);
}
//继承，c=>被填充的json，p=>用此json去填充
xy.deepCopy = function(c, p) {
	for (var i in p) {
		if (typeof(p[i]) === 'object') {
			c[i] = (p[i].constructor === Array) ? [] : {};
			arguments.callee(c[i], p[i]);
		} else {
			c[i] = p[i];
		}
	}
	return c;
};
//cookie
xy.cookie = function(key, val, opt) {
	if (val !== undefined) {
		opt = opt || {};
		if (val === null) {
			opt.expires = -1;
		}
		if (typeof opt.expires === "number") {
			var days = opt.expires,
				t = opt.expires = new Date();
			t.setDate(t.getDate() + days);
		}
		document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(val) + (opt.expires ? '; expires=' + opt.expires.toUTCString() : '') + (opt.path ? '; path=' + opt.path : '') + (opt.domain ? '; domain=' + opt.domain : '') + (opt.secure ? '; secure' : '');
	} else {
		if (document.cookie == "") {
			return ""
		}
		var aCookie = document.cookie.split('; ');
		for (var i = 0, l = aCookie.length; i < l; ++i) {
			var arr = aCookie[i].split('=');
			if (decodeURIComponent(arr[0]) == key) {
				return decodeURIComponent(arr[1]);
			}
		}
		return '';
	}
};
xy.ajax = function(json) {
	var opt = {
		"url": "",  //发生的链接地址
		"done": function() {}, //成功后执行的方法
		"fail": function() {}, //失败后执行的方法
		"type": "GET", //发送类型
		"data": null, //发送的数据 json格式，例：{'name':'abc'}
		"async": true, //异步或同步
		"cache": true,//是否缓存
		"dataType": ""//如果要跨域请求 请填写jsonp
	}
	for (var i in json) {
		opt[i] = json[i];
	}
	//处理跨域请求
	if (opt.dataType == "jsonp") {
		var oHead = document.getElementsByTagName("head")[0] || document.documentElement,
			oScript = document.createElement("script"),
			cb = "jsonp",
			done = false;
		oScript.async = true;
		oScript.src = opt.url + "?callback=" + cb;
		if (opt.data !== null) {
			var str = "&";
			for (var i in opt.data) {
				str += (i + "=" + opt.data[i] + "&");
			}
			oScript.src += str.substring(0, str.length - 1);
		}
		window[cb] = function(data) {
			opt.done(data);
			window[cb] = undefined;
			try {
				delete window[cb];
			} catch (e) {}
		};
		oScript.onload = oScript.onreadystatechange = function() {
			if (!done && (!this.readyState ||
				/loaded|complete/.test(oScript.readyState))) {
				done = true;
				oScript.onload = oScript.onreadystatechange = null;
				if (oScript.parentNode) {
					oHead.removeChild(oScript);
				}
			}
		};
		oHead.insertBefore(oScript, oHead.firstChild);
	} else {
		//1.创建Ajax对象
		var oAjax = null;
		if (window.XMLHttpRequest) {
			oAjax = new XMLHttpRequest();
		} else {
			oAjax = new ActiveXObject("Microsoft.XMLHTTP");
		}
		//判断提交方式，并且处理参数
		var isGet = opt.type.toLowerCase() == "get";
		if (opt.data !== null) {
			var str = "";
			for (var i in opt.data) {
				str += (i + "=" + opt.data[i] + "&");
			}
			str = str.substring(0, str.length - 1);
			if (isGet) {
				opt.url += "?" + str;
			} else {
				opt.data = str;
			}
		}
		//不缓存
		if (!opt.cache && isGet) {
			if (opt.url.indexOf("?") == -1) {
				opt.url = opt.url + "?xyajax=" + new Date().getTime();
			} else {
				opt.url = opt.url + "&xyajax=" + new Date().getTime();
			}
		}
		//2.连接服务器
		oAjax.open(opt.type.toUpperCase(), opt.url, opt.async);
		//post方式需加
		if (!isGet && opt.data !== null) {
			oAjax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
		}
		//3.发送请求
		oAjax.send(opt.data);

		//4.接收服务器的返回
		oAjax.onreadystatechange = function() {
			if (oAjax.readyState == 4) {
				if (oAjax.status == 200) {
					opt.done(oAjax.responseText);
				} else {
					if (opt.fail) {
						opt.fail(oAjax.status);
					}
				}
			}
		}
	}
};
xy.autoFocus = function() {
	if ("autofocus" in document.createElement("input")) {
		return false;
	}
	var aTxt = [],
		addObj = function(arr) {
			for (var i = 0, l = arr.length; i < l; i++) {
				if (arr[i].getAttribute("autofocus")) {
					aTxt.push(arr[i]);
				}
			}
		};
	addObj(document.getElementsByTagName("input"));
	addObj(document.getElementsByTagName("textarea"));
	addObj(document.getElementsByTagName("button"));
	aTxt[0].focus();
};
xy.placeholder = function() {
	if ("placeholder" in document.createElement("input")) {
		return false;
	}
	var aTxt = [],
		tip = function(obj, str) {
			var classN = obj.className;
			obj.className = classN + " placeholder";
			obj.attachEvent("onfocus", function() {
				if (obj.value == str) {
					obj.value = "";
					obj.className = classN;
				}
			});
			obj.attachEvent("onblur", function() {
				if (/^\s*$/.test(obj.value)) {
					obj.value = str;
					obj.className = classN + " placeholder";
				}
			});
		},
		addObj = function(arr) {
			for (var i = 0, l = arr.length; i < l; i++) {
				if (arr[i].getAttribute("placeholder")) {
					aTxt.push(arr[i]);
				}
			}
		};
	addObj(document.getElementsByTagName("input"));
	addObj(document.getElementsByTagName("textarea"));
	if (aTxt.length) {
		for (var i = 0, l = aTxt.length; i < l; i++) {
			var str = aTxt[i].getAttribute("placeholder");
			aTxt[i].value = str;
			tip(aTxt[i], str);
		}
	}
};
//检测浏览器是否支持某个Css3属性。
xy.supports = (function() {
	var div = document.createElement('div'),
		vendors = 'Khtml O Moz Webkit'.split(' '),
		len = vendors.length;
	return function(prop) {
		if (prop in div.style) return true;
		if ('-ms-' + prop in div.style) return true;
		prop = prop.replace(/^[a-z]/, function(val) {
			return val.toUpperCase();
		});
		for (var i = 0; i < len ; i++) {
			if (vendors[i] + prop in div.style) {
				return true;
			}
		}
		return false;
	};
})();
//打开新窗口
xy.openWin = function(url) {
	var a = document.createElement("a");
	a.setAttribute("href", url);
	a.setAttribute("target", "_blank");
	document.body.appendChild(a);
	a.click();
};
//选中文字
xy.selectText = function() {
	if (document.selection) {
		return document.selection.createRange().text;
	} else {
		return window.getSelection().toString();
	}
};
//检测新打开的窗口是否被阻止
xy.isOpenWin = function(sUrl) {
	try {
		var newWin = window.open(sUrl, '_blank');
		if (!newWin) {
			alert('弹出窗口被浏览器阻止了');
		}
	} catch (err) {
		alert('弹出窗口被浏览器阻止了');
	}
};
//扩充数组
xy.appendArr = function(arr1, arr2) {
	for (var i = 0, l = arr2.length; i < l; i++) {
		arr1.push(arr2[i]);
	}
};
//随机取色
xy.randomcolor = function() {
	var str = Math.ceil(Math.random() * 16777215).toString(16);
	if (str.length < 6) {
		str = "0" + str;
	}
	return str;
};
//快速排序
xy.quickSort = function(arr) {
　　if (arr.length <= 1) { return arr; }
　　var pivotIndex = Math.floor(arr.length / 2);
　　var pivot = arr.splice(pivotIndex, 1)[0];
　　var left = [];
　　var right = [];
　　for (var i = 0; i < arr.length; i++){
　　　　if (arr[i] < pivot) {
　　　　　　left.push(arr[i]);
　　　　} else {
　　　　　　right.push(arr[i]);
　　　　}
　　}
　　return quickSort(left).concat([pivot], quickSort(right));
};
//随机数
xy.rand = function(num) {
	return parseInt(Math.random() * num + 1);
};
//不够digit位数就往前补0
xy.fillZero = function(num, digit) {
	var str = '' + num;
	while (str.length < digit) {
		str = '0' + str;
	}
	return str;
};
//返回字符串长度
xy.getLength=function(str){
	var iNum = 0;
	for (var i = 0, l = str.length; i < l; i++) {
		encodeURI(str.charAt(i)).length > 2 ? iNum++  : iNum += 0.5;
	}
	return Math.ceil(iNum);
};
//图片预加载
xy.loadImage = function(url, callback) {
	var img = new Image(); //创建一个Image对象，实现图片的预下载
	img.src = url;
	if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数
		callback && callback.call(img); // 直接返回，不用再处理onload事件
	} else {
		img.onload = function() { //图片下载完毕时异步调用callback函数。
			callback && callback.call(img); //将回调函数的this替换为Image对象
			img.onload = null;
		}
	}
};
xy.tween = {
	//t : 当前时间   b : 初始值  c : 变化值   d : 总时间
	//return : 当前的位置
	linear: function(t, b, c, d) { //匀速
		return c * t / d + b;
	},
	easeIn: function(t, b, c, d) { //加速曲线
		return c * (t /= d) * t + b;
	},
	easeOut: function(t, b, c, d) { //减速曲线
		return -c * (t /= d) * (t - 2) + b;
	},
	easeBoth: function(t, b, c, d) { //加速减速曲线
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t + b;
		}
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	},
	easeInStrong: function(t, b, c, d) { //加加速曲线
		return c * (t /= d) * t * t * t + b;
	},
	easeOutStrong: function(t, b, c, d) { //减减速曲线
		return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	},
	easeBothStrong: function(t, b, c, d) { //加加速减减速曲线
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t * t * t + b;
		}
		return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	},
	elasticIn: function(t, b, c, d, a, p) { //正弦衰减曲线（弹动渐入）
		if (t === 0) {
			return b;
		}
		if ((t /= d) == 1) {
			return b + c;
		}
		if (!p) {
			p = d * 0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	},
	elasticOut: function(t, b, c, d, a, p) { //正弦增强曲线（弹动渐出）
		if (t === 0) {
			return b;
		}
		if ((t /= d) == 1) {
			return b + c;
		}
		if (!p) {
			p = d * 0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	},
	elasticBoth: function(t, b, c, d, a, p) {
		if (t === 0) {
			return b;
		}
		if ((t /= d / 2) == 2) {
			return b + c;
		}
		if (!p) {
			p = d * (0.3 * 1.5);
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		if (t < 1) {
			return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) *
				Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		}
		return a * Math.pow(2, -10 * (t -= 1)) *
			Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
	},
	backIn: function(t, b, c, d, s) { //回退加速（回退渐入）
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		return c * (t /= d) * t * ((s + 1) * t - s) + b;
	},
	backOut: function(t, b, c, d, s) {
		if (typeof s == 'undefined') {
			s = 3.70158; //回缩的距离
		}
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	backBoth: function(t, b, c, d, s) {
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		if ((t /= d / 2) < 1) {
			return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
		}
		return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	},
	bounceIn: function(t, b, c, d) { //弹球减振（弹球渐出）
		return c - Tween['bounceOut'](d - t, 0, c, d) + b;
	},
	bounceOut: function(t, b, c, d) {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
		}
		return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
	},
	bounceBoth: function(t, b, c, d) {
		if (t < d / 2) {
			return Tween['bounceIn'](t * 2, 0, c, d) * 0.5 + b;
		}
		return Tween['bounceOut'](t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
	}
};
//运动类 依赖css,Tween
xy.ClassAnimate = function(obj, json, times, fx, fn) {
	this.obj = obj;
	this.json = json;
	this.times = times || 500;
	this.fx = fx || "easeBoth";
	this.fn = fn;
	this.iCur = {};
	this.startTime = this.now();
	if ((typeof this.times).toLowerCase() === "function") {
		this.fn = this.times;
		this.times = 500;
	}
	for (var attr in this.json) {
		this.iCur[attr] = 0;
		if (attr == 'opacity') {
			this.iCur[attr] = Math.round(xy(this.obj).css(attr) * 100);
		} else {
			this.iCur[attr] = parseInt(xy(this.obj).css(attr));
		}
	}
	clearInterval(this.obj.timer);
	var _this = this;
	this.obj.timer = setInterval(function() {
		_this.move();
	}, 16.7);
};
xy.ClassAnimate.prototype = {
	now: function() {
		return (new Date()).getTime();
	},
	move: function() {
		var changeTime = this.now();
		var scale = 1 - Math.max(0, this.startTime - changeTime + this.times) / this.times;
		for (var attr in this.json) {
			var value = xy.tween[this.fx](scale * this.times, this.iCur[attr], this.json[attr] - this.iCur[attr], this.times);
			if (attr == 'opacity') {
				this.obj.style.filter = 'alpha(opacity=' + parseInt(value) + ')';
				this.obj.style.opacity = value / 100;
			} else {
				this.obj.style[attr] = value + 'px';
			}
		}
		if (scale == 1) {
			clearInterval(this.obj.timer);
			if (this.fn) {
				this.fn.call(this.obj);
			}
		}
	}
};

//普通拖拽
xy.ClassDrag = function(obj) {
	this.obj = obj;
	if (this.obj.offsetParent.nodeName.toLowerCase() == 'body' || this.obj.offsetParent.nodeName.toLowerCase() == 'html') {
		this.iClientL = document.documentElement.clientWidth;
		this.iClientT = document.documentElement.clientHeight;
		this.parentL = this.obj.offsetLeft;
		this.parentT = this.obj.offsetTop;
	} else {
		this.parentRo = this.obj.offsetParent.getBoundingClientRect();
		this.iClientL = this.obj.offsetParent.offsetWidth;
		this.iClientT = this.obj.offsetParent.offsetHeight;
		this.parentL = this.parentRo.left;
		this.parentT = this.parentRo.top;
	}
	var _this = this;
	this.obj.onmousedown = function(ev) {
		var oEv = ev || event;
		_this.down(oEv);
		return false;
	}
};
xy.ClassDrag.prototype.down = function(oEv) {
	this.ro = this.obj.getBoundingClientRect();
	this.iL = oEv.clientX - this.ro.left;
	this.iT = oEv.clientY - this.ro.top;
	var _this = this;
	if (this.obj.setCapture) {
		this.obj.setCapture();
		this.obj.onmousemove = function(ev) {
			var oEv = ev || event;
			_this.move(oEv, _this.obj);
		}
		this.obj.onmouseup = function() {
			_this.IEup(_this.obj);
		}
	} else {
		document.onmousemove = function(ev) {
			var oEv = ev || event;
			_this.move(oEv, _this.obj);
		}
		document.onmouseup = function() {
			_this.domUp();
		}
	}
};
xy.ClassDrag.prototype.move = function(oEv, obj) {
	var l = oEv.clientX - this.iL - this.parentL;
	var t = oEv.clientY - this.iT - this.parentT;
	if (l < 0) {
		l = 0;
	} else if (l > this.iClientL - this.obj.offsetWidth) {
		l = this.iClientL - this.obj.offsetWidth;
	}
	if (t < 0) {
		t = 0;
	} else if (t > this.iClientT - this.obj.offsetHeight) {
		t = this.iClientT - this.obj.offsetHeight;
	}
	obj.style.left = l + 'px';
	obj.style.top = t + 'px';
};
xy.ClassDrag.prototype.IEup = function(obj) {
	obj.onmousemove = null;
	obj.onmouseup = null;
	obj.releaseCapture();
};
xy.ClassDrag.prototype.domUp = function() {
	document.onmousemove = null;
	document.onmouseup = null;
};

//仿Win拖拽  （需继承拖拽和css）
xy.ClassDragWin = function(obj) {
	xy.ClassDrag.call(this, obj); //拖拽
};
for (var i in xy.ClassDrag.prototype) {
	xy.ClassDragWin.prototype[i] = xy.ClassDrag.prototype[i];
};
xy.ClassDragWin.prototype.down = function(oEv) {
	this.ro = this.obj.getBoundingClientRect();
	this.iL = oEv.clientX - this.ro.left;
	this.iT = oEv.clientY - this.ro.top;
	var _this = this;

	this.obj2 = this.obj.cloneNode(true);
	xy(this.obj2).css({
		'opacity': 0.5,
		'filter': 'alpha(opacity=' + 50 + ')'
	});
	if (isNaN(xy(this.obj).css('zIndex'))) {
		xy(this.obj2).css({
			'zIndex': 1
		});
	} else {
		var iIndex = xy(this.obj).css('zIndex');
		xy(this.obj2).css({
			'zIndex': iIndex + 1
		});
	}
	this.obj.parentNode.appendChild(this.obj2);
	if (this.obj2.setCapture) {
		this.obj2.setCapture();
		this.obj2.onmousemove = function(ev) {
			var oEv = ev || event;
			_this.move(oEv, _this.obj2);
		}
		this.obj2.onmouseup = function() {
			_this.obj.style.left = xy(_this.obj2).css('left');
			_this.obj.style.top = xy(_this.obj2).css('top');
			_this.obj.parentNode.removeChild(_this.obj2);
			_this.IEup(_this.obj2);
		}
	} else {
		document.onmousemove = function(ev) {
			var oEv = ev || event;
			_this.move(oEv, _this.obj2);
		}
		document.onmouseup = function() {
			_this.obj.style.left = xy(_this.obj2).css('left');
			_this.obj.style.top = xy(_this.obj2).css('top');
			_this.obj.parentNode.removeChild(_this.obj2);
			_this.domUp();
		}
	}
};

ClassXy.prototype = {
	//遍历
	each: function(fn) {
		for (var i = 0, l = this.elements.length; i < l; i++) {
			fn.call(this.elements[i], i);
		}
		return this;
	},
	getByClass: function(sTmp, oParent) {
		var obj = oParent || document,
			arr = [];
		if (obj.getElementsByClassName) {
			return arr = obj.getElementsByClassName(sTmp);
		} else {
			var arr = [],
				aChild = obj.getElementsByTagName('*'),
				re = new RegExp('\\b' + sTmp + '\\b', 'i');
			for (var i = 0; i < aChild.length; i++) {
				if (re.test(aChild[i].className)) {
					arr.push(aChild[i]);
				}
			}
			return arr;
		}
	},
	selectObj: function(str, idFn, classFn, tarFn) {
		switch (str.charAt(0)) {
			case "#":
				idFn();
				break;
			case ".":
				classFn();
				break;
			default:
				tarFn();
		}
	},
	firstOne: function(obj) {
		return obj.firstChild.nodeType == 1 ? obj.firstChild : this.nextOne(obj.firstChild);
	},
	lastOne: function(obj) {
		return obj.lastChild.nodeType == 1 ? obj.lastChild : this.prevOne(obj.lastChild);
	},
	prevOne: function(obj) {
		return obj.previousSibling.nodeType == 1 ? obj.previousSibling : this.prevOne(obj.previousSibling);
	},
	nextOne: function(obj) {
		return obj.nextSibling.nodeType == 1 ? obj.nextSibling : this.nextOne(obj.nextSibling);
	},
	find: function(str) {
		var _this = this,
			arr = [];
		this.each(function() {
			var that = this;
			_this.selectObj(str, function() {
				arr.push(document.getElementById(str.substring(1)));
			}, function() {
				_this.getByClass(str.substring(1), that);
			}, function() {
				xy.appendArr(arr, that.getElementsByTagName(str));
			});
		});
		this.elements = arr;
		return this;
	},
	first: function() {
		var arr = [],
			_this = this;
		this.each(function() {
			arr.push(_this.firstOne(this));
		});
		this.elements = arr;
		return this;
	},
	last: function() {
		var arr = [],
			_this = this;
		this.each(function() {
			arr.push(_this.lastOne(this));
		});
		this.elements = arr;
		return this;
	},
	next: function() {
		var arr = [],
			_this = this;
		this.each(function() {
			arr.push(_this.nextOne(this));
		});
		this.elements = arr;
		return this;
	},
	prev: function() {
		var arr = [],
			_this = this;
		this.each(function() {
			arr.push(_this.prevOne(this));
		});
		this.elements = arr;
		return this;
	},
	parent: function() {
		var arr = [],
			_this = this;
		this.each(function() {
			arr.push(this.parentNode);
		});
		this.elements = arr;
		return this;
	},
	siblings: function(str) {
		var arr = [],
			_this = this;
		if (arguments.length) {
			this.each(function() {
				var that = this;
				_this.selectObj(str, function() {
					arr.push(document.getElementById(str.substring(1)));
				}, function() {
					var aEle = _this.getByClass(str.substring(1), that.parentNode);
					for (var i = 0, l = aEle.length; i < l; i++) {
						if (aEle[i] !== that) {
							arr.push(aEle[i]);
						}
					}
				}, function() {
					var aEle = that.parentNode.getElementsByTagName(str);
					for (var i = 0, l = aEle.length; i < l; i++) {
						if (aEle[i] !== that) {
							arr.push(aEle[i]);
						}
					}
				});
			});
		} else {
			this.each(function() {
				var aEle = this.parentNode.getElementsByTagName("*");
				for (var i = 0, l = aEle.length; i < l; i++) {
					if (aEle[i] !== this) {
						arr.push(aEle[i]);
					}
				}
			});
		}
		this.elements = arr;
		return this;
	},
	eq: function(i) {
		return xy(this.elements[i]);
	},
	add: function(str, oParent) {
		var newXy = xy(str, oParent);
		xy.appendArr(this.elements, newXy.elements);
		return this;
	},
	not: function(str, oParent) {
		if ((typeof str).toLowerCase() == "number") {
			this.elements.splice(str, oParent);
		} else {
			var arr = this.elements,
				newArr = [],
				newXy = xy(str, oParent);
			for (var i = 0, l = arr.length; i < l; i++) {
				var bl = true;
				for (var j = 0, k = newXy.elements.length; j < k; j++) {
					if (arr[i] == newXy.elements[j]) {
						bl = false;
						break;
					}
				}
				if (bl) {
					newArr.push(arr[i]);
				}
			}
			this.elements = newArr;
		}
		return this;
	},
	index: function() {
		var aBrother = this.elements[0].parentNode.children;
		for (var i = 0; i < aBrother.length; i++) {
			if (aBrother[i] == this.elements[0]) {
				return i;
			}
		}
	},
	//css
	css: function(o) {
		if ((typeof o).toLowerCase() === "object") {
			return this.each(function() {
				for (var i in o) {
					this.style[i] = o[i];
				}
			});
		} else if ((typeof o).toLowerCase() === "string") {
			if (this.elements[0].currentStyle) {
				return this.elements[0].currentStyle[o];
			} else {
				return getComputedStyle(this.elements[0], false)[o];
			}
		}
	},
	addClass: function(str) {
		return this.each(function() {
			this.className += ' ' + str;
		});
	},
	removeClass: function(str) {
		return this.each(function() {
			var str2 = this.className;
			this.className = str2.replace(str, '');
		});
	},
	width: function(i) {
		if (arguments.length == 0) {
			if (this.elements[0] === window) {
				return document.documentElement.clientWidth;
			} else {
				return this.elements[0].offsetWidth;
			}
		} else {
			return this.each(function() {
				this.style.width = i + "px";
			});
		}
	},
	height: function(i) {
		if (arguments.length == 0) {
			if (this.elements[0] === window) {
				return document.documentElement.clientHeight;
			} else {
				return this.elements[0].offsetHeight;
			}
		} else {
			return this.each(function() {
				this.style.height = i + "px";
			});
		}
	},
	scrollTop: function(i) {
		if (this.elements[0] === window || this.elements[0] === document.getElementsByName("body")[0] || this.elements[0] === document.getElementsByName("html")[0]) {
			if (arguments.length > 0) {
				document.documentElement.scrollTop = document.body.scrollTop = i;
				return this;
			} else {
				return document.documentElement.scrollTop || document.body.scrollTop;
			}
		} else {
			if (arguments.length > 0) {
				return this.each(function() {
					this.scrollTop = i;
				});
			} else {
				return this.elements[0].scrollTop;
			}
		}
	},
	offsetVis: function() {
		return this.elements[0].getBoundingClientRect();
	},
	offset: function(pos) {
		if (pos == "left") {
			return this.offsetVis().left;
		} else {
			return this.offsetVis().top + xy(window).scrollTop();
		}
	},
	positionTop: function() {
		return this.elements[0].offsetTop;
	},
	positionLeft: function() {
		return this.elements[0].offsetLeft;
	},
	val: function(str) {
		if (arguments.length > 0) {
			return this.each(function() {
				this.value = str;
			});
		} else {
			return this.elements[0].value;
		}
	},
	html: function(str) {
		if (arguments.length > 0) {
			return this.each(function() {
				this.innerHTML = str;
			});
		} else {
			return this.elements[0].innerHTML;
		}
	},
	append:function(obj) {
		if ((typeof obj).toLowerCase()==="object") {
			this.elements[0].appendChild(obj.elements[0]);
		}else{
			var newXy=xy(obj);
			this.elements[0].appendChild(newXy.elements[0]);
		}
		return this;
	},
	appendTo:function(obj,oParent) {
		if ((typeof obj).toLowerCase()==="object") {
			obj.append(this);
		}else{
			xy(obj,oParent).append(this);
		}
	},
	prepend:function(obj) {
		if ((typeof obj).toLowerCase()==="object") {
			var arr=this.elements[0].children;
			if(arr.length>0){
				this.elements[0].insertBefore(obj.elements[0], arr[0]);
			}else{
				this.elements[0].appendChild(obj.elements[0]);
			}
		}else{
			var newXy=xy(obj);
			var arr=this.elements[0].children;
			if(arr.length>0){
				this.elements[0].insertBefore(newXy.elements[0], arr[0]);
			}else{
				this.elements[0].appendChild(newXy.elements[0]);
			}
		}
		return this;
	},
	prependTo:function(obj,oParent) {
		if ((typeof obj).toLowerCase()==="object") {
			obj.prepend(this);
		}else{
			xy(obj,oParent).prepend(this);
		}
	},
	remove:function(obj) {
		return this.each(function() {
			for (var i = 0,l=obj.elements.length; i < l ; i++) {
				this.remove(obj.elements[i]);
			}
		});
	},
	//事件绑定
	on: function(sEvent, fn) {
		var _arg = arguments,
			_this = this;
		return this.each(function() {
			if (_arg.length > 2) {
				this["xy_" + sEvent] = function(e) {
					e = e || event;
					var oTarget = e.target || e.srcElement;
					_this.selectObj(_arg[1], function() {
						if (oTarget.id === _arg[1].substring(1)) {
							_arg[2].call(oTarget, e);
						}
					}, function() {
						var aClass = oTarget.className.split(" ");
						for (var i = 0, l = aClass.length; i < l; i++) {
							if (aClass[i] == _arg[1].substring(1)) {
								_arg[2].call(oTarget, e);
							}
						}
					}, function() {
						if (oTarget.nodeName.toLowerCase() === _arg[1]) {
							_arg[2].call(oTarget, e);
						}
					});
				};
			} else {
				this["xy_" + sEvent] = function(e) {
					e = e || event;
					fn.call(this, e);
				};
			}
			if (this.attachEvent) {
				this.attachEvent('on' + sEvent, this["xy_" + sEvent]);
			} else {
				this.addEventListener(sEvent, this["xy_" + sEvent], false);
			}
		});
	},
	//解除事件绑定
	off: function(sEvent) {
		return this.each(function() {
			if (this.removeEventListener) {
				this.removeEventListener(sEvent, this["xy_" + sEvent], false);
			} else {
				this.detachEvent("on" + sEvent, this["xy_" + sEvent]);
			}
		});
	},
	//触发事件
	trigger: function(sEv) {
		return this.each(function() {
			if (this.fireEvent) {
				this.fireEvent("on" + sEv);
			} else {
				var evt = document.createEvent('HTMLEvents');
				evt.initEvent(sEv, true, true);
				this.dispatchEvent(evt);
			}
		});
	},
	click: function(fn) {
		return this.each(function() {
			this.onclick = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	mouseover: function(fn) {
		return this.each(function() {
			this.onmouseover = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	mouseout: function(fn) {
		return this.each(function() {
			this.onmouseout = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	mousedown: function(fn) {
		return this.each(function() {
			this.onmousedown = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	mouseup: function(fn) {
		return this.each(function() {
			this.onmouseup = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	mousemove: function(fn) {
		return this.each(function() {
			this.onmousemove = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	keydown: function(fn) {
		return this.each(function() {
			this.onkeydown = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	keyup: function(fn) {
		return this.each(function() {
			this.onkeyup = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	keypress: function(fn) {
		return this.each(function() {
			this.onkeypress = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	blur: function(fn) {
		return this.each(function() {
			this.onblur = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	focus: function(fn) {
		return this.each(function() {
			this.onfocus = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	change: function() {
		return this.each(function() {
			this.onchange = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	submit: function() {
		return this.each(function() {
			this.onsubmit = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	scroll: function(fn) {
		return this.each(function() {
			this.onscroll = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	resize: function(fn) {
		return this.each(function() {
			this.onresize = function(e) {
				e = e || event;
				fn.call(this, e);
			};
		});
	},
	data: function(attr, val) {
		if (arguments.length > 1) {
			return this.each(function() {
				this.dataset ? this.dataset[attr] = val : this.setAttribute("data-" + attr, val);
			});
		} else {
			return this.elements[0].dataset ? this.elements[0].dataset[attr] : this.elements[0].getAttribute("data-" + attr);
		}
	},
	attr: function(attr, val) {
		if (arguments.length > 1) {
			return this.each(function() {
				this.setAttribute(attr, val);
			});
		} else {
			return this.elements[0].getAttribute(attr);
		}
	},
	show: function(fn) {
		return this.each(function() {
			this.style.display = "block";
			if (fn) {
				fn.call(this);
			}
		});
	},
	hide: function(fn) {
		return this.each(function() {
			this.style.display = "none";
			if (fn) {
				fn.call(this);
			}
		});
	},
	queue:function(name,fn) {
		if (!(this.[name] instanceof Array)) {
			this.[name]=[];
		}
		this.[name].push(fn);
	},
	dequeue:function() {
		if (this.[name] instanceof Array && this.[name].length) {
			var self=arguments.callee;
			this.[name].shift()(function() {
				self(name);
			});
		}
	},
	animate: function(json, times, fx, fn) {
		return this.each(function() {
			new xy.ClassAnimate(this, json, times, fx, fn);
		});
	},
	drag: function(bl) {
		if (bl) {
			return this.each(function() {
				new xy.ClassDragWin(this);
			});
		} else {
			return this.each(function() {
				new xy.ClassDrag(this);
			});
		}
	}
};