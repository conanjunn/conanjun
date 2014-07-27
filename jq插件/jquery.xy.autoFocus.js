/*
html5  autofocus兼容
$.xy.autoFocus();
*/

jQuery.xy_autoFocus = function() {
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