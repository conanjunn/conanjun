define(function(require, exports, module) {
	/*
		给form加 h5f 属性
		给提交按钮加 data-submit="1"
	*/
	(function(root, factory) {
		if (typeof define === 'function' && define.amd) {
			// AMD. Register as an anonymous module.
			define(factory);
		} else if (typeof module == 'object' && module.exports) {
			// CommonJS
			require('checkForm/h5f');
			module.exports = factory();
		} else {
			// Browser globals
			root.checkForm = factory();
		}
	})(this, function() {
		var checkForm = function(option) {
			option = $.extend(true, {
				blur: true, //是否blur事件检测
				isBreak: false, // 是否一个出错就停止检测
				btn: $('[data-submit]'), // 提交按钮
				notice: {
					valueMissing: '此项不能为空',
					patternMismatch: '您输入的格式不正确',
					typeMismatch: {
						email: '邮箱格式不正确',
						url: '网址格式不正确'
					},
					tooLong: '您输入的文本过长',
					rangeUnderflow: '您输入的数字过小',
					rangeOverflow: '您输入的数字过大'
				},
				succCallback: function() {},
				errCallback: false
			}, option || {});
			var $p = $('form[h5f]').attr('novalidate', 'novalidate');

			var errHandler = function(msg) {
				if (option.errCallback) {
					option.errCallback.call(this);
				} else {
					alert(msg);
				}
			};

			option.btn.on('click', function(e) {
				e.preventDefault();
				var _this = this;
				$p.find('input').each(function() {
					if (this.validity.valueMissing || /^\s*$/.test(this.value)) {
						errHandler.call(this, option.notice.valueMissing);
						if (option.isBreak) {
							return false;
						}
					} else if (this.validity.valid) {
						option.succCallback.call(_this);
					} else if (this.validity.patternMismatch) {
						errHandler.call(this, option.notice.patternMismatch);
						if (option.isBreak) {
							return false;
						}
					} else if (this.validity.typeMismatch) {
						errHandler.call(this, option.notice.typeMismatch[this.type]);
						if (option.isBreak) {
							return false;
						}
					} else if (this.validity.tooLong) {
						errHandler.call(this, option.notice.tooLong);
						if (option.isBreak) {
							return false;
						}
					} else if (this.validity.rangeUnderflow) {
						errHandler.call(this, option.notice.rangeUnderflow);
						if (option.isBreak) {
							return false;
						}
					} else if (this.validity.rangeOverflow) {
						errHandler.call(this, option.notice.rangeOverflow);
						if (option.isBreak) {
							return false;
						}
					}
				});
			});

			if (option.btn.attr('type') != 'submit') {
				$p.on('submit', function(e) {
					e.preventDefault();
					return false;
				});
				$p.on('keydown', function(e) {
					if (e.keyCode == 13) {
						e.preventDefault();
						option.btn.trigger('click');
					}
				});
			}
		};

		if ($('[data-submit]').length && $('form[h5f]').length) {
			checkForm();
		}
		return checkForm;
	});
});