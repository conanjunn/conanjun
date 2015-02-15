(function($) {
	$.fn.xy_tab = function(options) {
		var opt = $.extend({}, $.fn.xy_tab.defaults, options);
		return this.each(function() {
			var $p = $(this),
				$ulLi = $p.find("ul li"),
				$len = $ulLi.length,
				num = 0,
				fnChange,
				autoPlay,
				timeout,
				resetTime,
				timer;
			if (opt.createTag) {
				var arr = ["<ol>"],
					len = $ulLi.length;
				while (len--) {
					arr.push("<li></li>");
				}
				arr.push("</ol>");
				$p.append(arr.join(""));
			}
			var $olLi = $p.find("ol li");
			if (opt.animate == "move") {
				fnChange = function(index) {
					var $ul = $p.find("ul"),
						$width = $p.width();
					$olLi.eq(index).addClass(opt.className).siblings().removeClass(opt.className);
					$ul.stop().animate({
						"left": -index * $width
					}, opt.animateSpeed);
				};
			} else if (opt.animate == "fade") {
				fnChange = function(index) {
					$olLi.eq(index).addClass(opt.className).siblings().removeClass(opt.className);
					$ulLi.eq(index).fadeIn(opt.animateSpeed).siblings().fadeOut(opt.animateSpeed);
				};
				$ulLi.eq(0).fadeIn(0).siblings().fadeOut(0);
			} else {
				fnChange = function(index) {
					$olLi.eq(index).addClass(opt.className).siblings().removeClass(opt.className);
					$ulLi.eq(index).show().siblings().hide();
				};
				$ulLi.eq(0).show().siblings().hide();
			}
			$olLi.on(opt.myEvent, function() {
				var _this = this;
				if (timeout) {
					clearTimeout(timeout);
				}
				timeout = setTimeout(function() {
					num = $(_this).index();
					fnChange(num);
				}, opt.delay);
			});
			$olLi.eq(0).addClass(opt.className);
			autoPlay = function() {
				num = (num + 1) % $len;
				fnChange(num);
			};
			resetTime = function() {
				clearInterval(timer);
				timer = setInterval(autoPlay, opt.time);
			};
			if (opt.autoPlay) {
				timer = setInterval(autoPlay, opt.time);
				$p.on({
					"mouseover": function() {
						clearInterval(timer);
					},
					"mouseout": function() {
						clearInterval(timer);
						timer = setInterval(autoPlay, opt.time);
					}
				});
			}
			if (opt.hasBtn) {
				$("#" + opt.btnNext).on("click", function() {
					autoPlay();
					if (opt.autoPlay) {
						resetTime();
					}
				});
				$("#" + opt.btnPrev).on("click", function() {
					num = (num + $len - 1) % $len;
					fnChange(num);
					if (opt.autoPlay) {
						resetTime();
					}
				});
			}
		});
	};
	$.fn.xy_tab.defaults = {
		"className": "on", //小图标变换的样式
		"hasBtn": 0, //是否有上一个下一个按钮
		"btnPrev": "", //上一个按钮的id
		"btnNext": "", //下一个按钮的id
		"animate": "none", //是否有动画 none=>无动画; fade=>淡入淡出; move=>左右运动
		"animateSpeed": 400, //动画的速度
		"myEvent": "mouseover", //用什么事件来触发
		"autoPlay": 0, //是否自动播放
		"time": 3000, //自动播放的时间
		"delay": 0, //事件处理的延迟时间
		"createTag": 0 //小图片是否用js创建
	};
})(jQuery);