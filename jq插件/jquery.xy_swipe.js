/*
$('#div').xy_swipe({
	'left':function() {

	},
	'right':function() {

	},
	'top':function() {

	},
	'bottom':function() {

	}
});
*/
(function($) {
	$.fn.xy_swipe=function(option) {
		return this.each(function() {
			var orientationX=orientationY='',
				startXTarget=endXTarget=startYTarget=startYTarget=0;
			this.addEventListener('touchstart',function(e) {
				var oTarget=e.targetTouches[0];
				startXTarget=oTarget.pageX;
				startYTarget=oTarget.pageY;
			},false);
			this.addEventListener('touchmove',function(e) {
				e.preventDefault();
				var oTarget=e.targetTouches[0];
				endXTarget=oTarget.pageX;
				endYTarget=oTarget.pageY;
			},false);
			this.addEventListener('touchend',function(e) {
				orientationX=startXTarget<endXTarget?'left':'right';
				orientationY=startYTarget>endYTarget?'top':'bottom';
				option[orientationX] && option[orientationX].call(this,e);
				option[orientationY] && option[orientationY].call(this,e);
			},false);
		});
	};
})(jQuery);