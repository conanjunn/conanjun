/*
图片预加载
url:
callback:
*/

jQuery.xy_loadImg = function(url, callback) {
	var img = new Image(); 
	img.src = url;
	if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数
		callback && callback.call(img); 
	} else {
		img.onload = function() { 
			callback && callback.call(img); 
			img.onload = null;
		}
	}
};