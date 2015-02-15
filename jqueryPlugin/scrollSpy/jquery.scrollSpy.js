/*
	data-anchor="anchor"
	data-target="#div1"
	data-active_class_name="on"
	data-offset="100"
*/
(function() {
	var $w = $(window);
	var $anchorArr = {};
	var handlerClick, handlerScroll, handlerReset;
	$(function() {
		var $anchorParent = $('[data-anchor=anchor]');
		var anchorArr = [];
		var idArr = [];
		var targetArr = [];
		var activeClass = $anchorParent.data('active_class_name') || 'active';
		$anchorParent.find('a').each(function() {
			var attr = $(this).attr('href');
			if (attr.charAt(0) == '#') {
				anchorArr.push(this);
				idArr.push(attr.substring(1));
			}
		});
		$($anchorParent.data('target')).children().each(function() {
			if (idArr.indexOf($(this).attr('id')) != -1) {
				targetArr.push(this);
			}
		});

		$anchorArr = $(anchorArr);
		var $targetArr = $(targetArr);
		var $offsetTopArr = [];
		var recordIndex = null;
		var iOffset = $anchorParent.data('offset');
		handlerClick = function(e) {
			e.preventDefault();
			var $t = $(this);
			$('html,body').stop().animate({
				scrollTop: $targetArr.eq($anchorArr.index(this)).offset().top - iOffset
			}, function() {
				location.hash = $t.attr('href');
			});
		};
		handlerScroll = function() {
			var iScrollTop = $w.scrollTop() + iOffset;
			$.each($offsetTopArr, function(i, t) {
				if (iScrollTop >= t) {
					recordIndex = i;
				}
			});
			if (recordIndex !== null) {
				$anchorArr.removeClass(activeClass).eq(recordIndex).addClass(activeClass);
			}
		};
		handlerReset = function() {
			$offsetTopArr = [];
			$targetArr.each(function() {
				$offsetTopArr.push($(this).offset().top);
			});
			handlerScroll();
		};
		$offsetTopArr = [];
		$targetArr.each(function() {
			$offsetTopArr.push($(this).offset().top);
		});
		$anchorArr.on('click', handlerClick);
		$w.on('scroll', handlerScroll);
		$w.on('reset', handlerReset);
	});

	var removeScrollSpy = function() {
		$anchorArr.off('click', handlerClick);
		$w.off('scroll', handlerScroll);
		$w.off('reset', handlerReset);
	};

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(removeScrollSpy);
	} else if (typeof module == 'object' && module.exports) {
		// CommonJS
		module.exports = removeScrollSpy;
	} else {
		// Browser globals
		window.removeScrollSpy = removeScrollSpy;
	}
})();