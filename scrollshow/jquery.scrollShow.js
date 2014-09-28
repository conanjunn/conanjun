define(function(require, exports, module) {
	(function($) {
		$.fn.scrollShow = function(option) {
			if (!option) {
				return this.each(function() {
					$(window).off('scroll', this.scrollShow).off('resize', this.scrollShowResize);
				});
			}
			var opt = $.extend({
				offset: 0, // 正数代表多滚动一段距离在触发showCallback，负数相反
				showCallback: function() {}, // 当元素出现在屏幕上时的callback， this=>当前元素 参数e=> event
				hideCallback: function() {} // 当元素离开时的callback， this=>当前元素 参数e=> event
			}, option || {});
			var $win = $(window);
			return this.each(function() {
				var $t = $(this);
				var iOffset = $t.offset().top + opt.offset;
				var iHeight = parseInt($t.height());
				var isShow = false;
				var _this = this;
				var iScroll = 0;
				this.scrollShow = function(e) {
					iScroll = $win.scrollTop();
					if (iScroll >= iOffset - iHeight && iScroll < iOffset + iHeight && !isShow) {
						isShow = true;
						opt.showCallback.call(_this, e);
					} else if ( (iScroll < iOffset - iHeight || iScroll >= iOffset + iHeight) && isShow) {
						isShow = false;
						opt.hideCallback.call(_this, e);
					}
				};
				this.scrollShowResize = function(e) {
					iScroll = $win.scrollTop();
					iOffset = $t.offset().top + opt.offset;
					iHeight = parseInt($t.height());
					_this.scrollShow(e);
				};
				$win.on('scroll', this.scrollShow).on('resize', this.scrollShowResize);
			});
		};
	})(jQuery);
});