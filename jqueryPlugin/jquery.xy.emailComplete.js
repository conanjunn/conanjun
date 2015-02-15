/*
邮箱自动完成插件
用法$(".txt").xy_emailComplete(); 
.txt必须是input的外包div
参数opt可选，有参数时将使用参数的邮箱后缀

样式：
.xy_autoComplete{ position:absolute; left:0; background:#FFF;display:none; border:1px solid #999; border-radius:0 0 5px 5px;overflow:hidden;cursor:default; font-size:12px;  z-index:9999; box-sizing:border-box; -webkit-box-sizing:border-box; -moz-box-sizing:border-box; -o-box-sizing:border-box; -ms-box-sizing:border-box;}
.xy_autoComplete li{padding-left:10px; line-height:2; }
.xy_autoComplete .on{ background:#ccc; }
*/

(function($) {
	$.fn.xy_emailComplete = function(opt) {
		return this.each(function() {
			var $this = $(this).find('input').attr("autoComplete", "off"),
				$p = $this.parent().css({
					"position": "relative"
				}),
				list = opt || ["gmail.com", "sina.com", "163.com", "qq.com", "126.com", "vip.sina.com", "sina.cn", "hotmail.com", "sohu.com", "yahoo.cn", "139.com", "wo.com.cn", "189.cn", "21cn.com"],
				$u = $('<ul class="xy_autoComplete"></ul>').css({
					"width": ($this.outerWidth()),
					"top": ($this.height() + 2)
				}).appendTo($p),
				bl = true,
				timer = null;
			$this.on({
				"input": function() {
					clearTimeout(timer);
					timer = setTimeout(function() {
						var $v = $this.val();
						if ($v.length >= 1 && bl) {
							$u.show();
							var str = "<li>请选择:</li><li class=\"on\">" + $v + "</li>",
								r = $v.substring($v.indexOf("@") + 1),
								re = new RegExp("^" + r);
							for (var i = 0, l = list.length; i < l; i++) {
								if ($v.indexOf("@") > -1) {
									if (re.test(list[i]) && r != list[i]) {
										str += "<li>" + $v.substring(0, $v.indexOf("@") + 1) + list[i] + "</li>";
									}
								} else {
									str += "<li>" + $v + "@" + list[i] + "</li>";
								}
							}
							$u.html(str);
						} else {
							$u.hide();
							bl = true;
						}
					}, 100);
				},
				"blur": function() {
					$u.hide();
					bl = false;
				},
				"keydown": function(e) {
					switch (e.which) {
						case 40:
							var $l = $u.find(".on").removeClass("on");
							$l.is($u.find("li").last()) ? $u.find("li").eq(1).addClass("on") : $l.next().addClass("on");
							return false;
						case 38:
							var $l = $u.find(".on").removeClass("on");
							$l.is($u.find("li").eq(1)) ? $u.find("li").last().addClass("on") : $l.prev().addClass("on");
							return false;
						case 13:
							$this.val($u.hide().find(".on").html());
							bl = false;
							return false;
						case 9:
							$u.hide();
							break;
						case 32:
							return false;
					}
				}
			});
			$u.on("mousedown", "li:not(:first)", function() {
				$this.val($(this).html());
			}).on("mouseover", "li:not(:first)", function() {
				$(this).addClass("on").siblings().removeClass("on");
			});
			//for ie
			if (document.all) {
				var _this = this;
				this.attachEvent('onpropertychange', function(e) {
					if (e.propertyName != 'value') return;
					$(_this).trigger('input');
				});
			}
		});
	}
})(jQuery);