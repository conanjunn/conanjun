/*
	拖拽
	css: 需将元素定义为position:absolute; z-index: ...;
	$('#div1').xy_drag(true);
	参数：obj =>被拖动的对象，默认自己。
		  prent=>
		  true代表拖拽限制在父级元素内。
		  无参数代表限制在当前窗口内
*/

(function($) {       
	$.fn.xy_drag = function(obj,parent) {
		var $d=$(document),
			$w=$(window);
		return this.each(function() {      
			var $this = $(this),
				$p = null,
				$obj = typeof(obj) == "object" ? obj : $this;
			if (parent) {
				$p=$(this).parent();
			}
			$this.on('mousedown',function (e) {
				this.onselectstart = function() {
					return false
				};
				$obj.css({'cursor':'move','opacity':'0.3'});
				var iL=$p?e.pageX-$obj.offset().left+$p.offset().left : e.pageX-$obj.offset().left,
					iT=$p?e.pageY-$obj.offset().top+$p.offset().top : e.pageY-$obj.offset().top;
				$d.on('mousemove',function (ev) {
					var iL2=ev.pageX-iL,
						iT2=ev.pageY-iT,
						iClientX=$p?$p.width()-$obj.width() : $w.width()-$obj.width(),
						iClientY=$p?$p.height()-$obj.height()+$w.scrollTop() : $w.height()-$obj.height()+$w.scrollTop();
					if (iL2>iClientX) {
						iL2=iClientX;
					}else if (iL2<0) { 
						iL2=0;
					}
					if (iT2>iClientY) {
						iT2=iClientY;
					}else if (iT2<0) {
						iT2=0;
					}
					$obj.css({'top':iT2,'left':iL2});
				});
				$d.mouseup(function () {
					$obj.css({'cursor':'default','opacity':'1'});
					$d.off('mousemove').off('mouseup');
				});
				return false;
			});
		}); 
	}              
})(jQuery);