angular.js自定义指令中独立scope的表达式绑定传参问题
=====
我们都知道，angular里的directive可拥有自己的独立scope.

```javascript
angular.module('app', []).directive('myDirective', function() {
	return {
		scope: {} // 为此指令创建一个全新的scope
		...
	};
});
```

`scope`的`{}`中可以用一个`&`符号绑定一个父级的表达式（一般用来绑定函数）。

html:
```html
<div ng-controller="ctrl">
    <div my-directive my-attr="demo()"></div>
</div>

```
js: 
```javascript
var app = angular.module('app', []);

app.controller('ctrl', ['$scope', function($scope) {
	$scope.demo = function() {
		console.log(123);
	};
}]);


angular.module('app', []).directive('myDirective', function() {
	return {
		scope: {
			myAttr: '&'
		},
		link: function($scope, ele) {
		    $scope.myAttr(); // 控制台里会输出“123”
		}
	};
});
```

上述代码`$scope.myAttr()`调用的是**controller**里的`$scope.demo`函数。函数是可以传**参数**的，这里可以吗？试一试：
```javascript
var app = angular.module('app', []);

app.controller('ctrl', ['$scope', function($scope) {
	$scope.demo = function(num) {
		console.log(num); // 控制台输出 undefined
	};
}]);


angular.module('app', []).directive('myDirective', function() {
	return {
		scope: {
			myAttr: '&'
		},
		link: function($scope, ele) {
		    $scope.myAttr(123); // 控制台里会输出“123”
		}
	};
});
```
失败了！



机智的你肯定发觉了只改了js代码，html代码里的调用没有改！于是乎：
```html
<div ng-controller="ctrl">
    <div my-directive my-attr="demo(num)"></div>
</div>

```
CA,还是不行！
... ...

------

无奈之下去翻看官方文档,发现行小字！
> Often it's desirable to pass data from the isolated scope via an expression to the parent scope, this can be done by passing a map of local variable names and values into the expression wrapper fn. For example, if the expression is increment(amount) then we can specify the amount value by calling the localFn as localFn({amount: 22}).

大概意思是说：如果想像上面的代码一样传参数，参数要写成**json**的形式。
果断尝试下：
html:
```html
<div ng-controller="ctrl">
    <div my-directive my-attr="demo(num)"></div>
</div>

```
js: 
```javascript
var app = angular.module('app', []);

app.controller('ctrl', ['$scope', function($scope) {
	$scope.demo = function(num) {
		console.log(num); // 控制台输出 123
	};
}]);


angular.module('app', []).directive('myDirective', function() {
	return {
		scope: {
			myAttr: '&'
		},
		link: function($scope, ele) {
		    $scope.myAttr({num: 123}); 
		}
	};
});
```

成功！
问：为什么这么写就可以呢？
答：我也不清楚，你要是研究明白了，请留言给我！大谢！

####注意： 
这里的参数不能是dom对象！否则angular会报错！例如写成这样：
```javascript
$scope.myAttr({num: $('#div')}); // 报错
```
原因应该是angular的表达式解析机制是不解析dom对象的。
