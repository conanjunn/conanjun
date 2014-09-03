define(function(require, exports, module) {
	var ClassScrollShow = function(obj, option) {
		this.obj = obj;
		option = $.extend({
			callbackShow: false,
			callbackHide: false,
			deep: false
		}, option || {});
		this.deep = option.deep;
		this.callbackSucc = option.callbackShow;
		this.callbackErr = option.callbackHide;
		this.bindEvents = null;
		this.isScrollVis();
	};
	ClassScrollShow.prototype.scrollY = function() {
		return document.body.scrollTop || document.documentElement.scrollTop;
	};
	ClassScrollShow.prototype.posWinTop = function(obj) {
		if (this.obj.getBoundingClientRect()) {
			var ro = this.obj.getBoundingClientRect();
			return ro.top + this.scrollY();
		} else {
			var iTop = 0;
			while (this.obj) {
				iTop += this.obj.offsetTop;
				this.obj = this.obj.offsetParent;
			}
			return iTop;
		}
	};
	ClassScrollShow.prototype.events = function() {
		var iClient = document.documentElement.clientHeight,
			ro = this.obj.getBoundingClientRect(),
			scrollTop = this.scrollY(),
			offsetT = this.posWinTop(this.obj) + this.obj.offsetHeight,
			t = ro.top,
			bll = this.deep ? (t < iClient && scrollTop < offsetT && !this.obj.scrollShow) : (t <= 0 && scrollTop < offsetT && !this.obj.scrollShow),
			_bll = this.deep ? ((t >= iClient || scrollTop >= offsetT) && this.obj.scrollShow) : ((t < 0 || scrollTop >= offsetT) && this.obj.scrollShow);
		if (bll) {
			this.obj.scrollShow = true;
			this.callbackSucc && this.callbackSucc.call(this.obj);
		} else if (_bll) {
			this.obj.scrollShow = false;
			this.callbackErr && this.callbackErr.call(this.obj);
		}
	};
	ClassScrollShow.prototype.isScrollVis = function() {
		this.bindEvents = this.events.bind(this);
		this.bindEvents();
		window.addEventListener('scroll', this.bindEvents, false);
		window.addEventListener('resize', this.bindEvents, false);
	};
	ClassScrollShow.prototype.removeEvent = function() {
		window.removeEventListener('scroll', this.bindEvents, false);
		window.removeEventListener('resize', this.bindEvents, false);
	};
	if (window.jQuery) {
		/*
			$('#div1').scrollShow({
				deep:false,
				callbackShow:function(){},
				callbackHide:function(){}
			});
			取消事件
			$('#div1').removeScrollShow();
		*/
		jQuery.fn.scrollShow = function(option) {
			return this.each(function() {
				this.xy_scrollShow = new ClassScrollShow(this, option);
			});
		};
		jQuery.fn.removeScrollShow = function() {
			return this.each(function() {
				if (this.xy_scrollShow) {
					this.xy_scrollShow.removeEvent();
				}
			});
		};
	}
	return function(obj, option) {
		return new ClassScrollShow(obj, option);
	}
});