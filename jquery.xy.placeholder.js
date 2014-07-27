/*
HTML5 placeholder兼容
$.xy.placeholder();
提示文字的样式为：placeholder；
*/

jQuery.xy_placeholder = function() {
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