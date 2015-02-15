/*
倒计时
参数
{
	year:2014,
	month:8,
	day:23,
	hour:17,
	minutes:30,
	second:59
}或直接写秒数
*/

jQuery.xy_countZero=function(opt,fn,endFn) {
	var timeT=(new Date()).getTime(),
		ic="";
	if ((typeof opt).toLowerCase()==="object") {
		var oDate=new Date();
		oDate.setFullYear(opt.year,opt.month-1,opt.day);
		oDate.setHours(opt.hour,opt.minutes,opt.second);
		ic=(oDate.getTime()-timeT)+"";
		ic=parseInt(ic.substring(0,ic.length-3));
	}else{
		timeT=timeT+"";
		timeT=parseInt(timeT.substring(0,timeT.length-3));
		ic=opt-timeT;
	}
	var t=Math.floor(ic/86400);
	ic%=86400;
	var h=Math.floor(ic/3600);
	ic%=3600;
	var f=Math.floor(ic/60);
	ic%=60;
	var m=Math.floor(ic);
	fn(t,h,f,m);
	var timer=setInterval(function() {
		if (--m<0) {
			m=59;
			if (--f<0) {
				f=59;
				if (--h<0) {
					h=23;
					t=--t>0?t:0;
				}
			}
		}
		if (m<1&&f<1&&h<1&&t<1) {
			clearInterval(timer);
			endFn();
		}else{
			fn(t,h,f,m);
		}
	},1000);
};