/*
图片延时加载：
$.xy.delayLoadImg();
*/

jQuery.xy_delayLoadImg=function() {
	var $img=$("img[data-_src]"),
		changeImg=function() {
			$img.each(function() {
				var $t=$(this),
					$w=$(window);
				if($w.height()+$w.scrollTop()>=$t.offset().top && $t.data("_src")){
					alert(12);
					$t.attr("src",$t.data("_src")).data("_src",null);
				}
			});
		};
	changeImg();
	$(window).on("scroll",changeImg);
};