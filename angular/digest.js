var Scope = function() {
    this.$$watchers = [];
};

Scope.prototype.$watch = function(watchExp, listener) {
    this.$$watchers.push({
        watchExp: watchExp,
        listener: listener || function() {}
    });
};

Scope.prototype.$digest = function() {
    var dirty;

    do {
        dirty = false;

        for (var i = 0; i < this.$$watchers.length; i++) {
            var newValue = this.$$watchers[i].watchExp(),
                oldValue = this.$$watchers[i].last;

            if (oldValue !== newValue) {
                this.$$watchers[i].listener(newValue, oldValue);

                dirty = true;

                this.$$watchers[i].last = newValue;
            }
        }
    } while (dirty);
};


var $scope = new Scope();

$scope.name = 'Ryan';

var element = document.querySelectorAll('input');

element[0].onkeyup = function() {
    $scope.name = element[0].value;

    $scope.$digest();
};

$scope.$watch(function() {
    return $scope.name;
}, function(newValue, oldValue) {
    console.log('Input value updated - it is now ' + newValue);

    element[0].value = $scope.name;
});

var updateScopeValue = function updateScopeValue() {
    $scope.name = 'Bob';
    $scope.$digest();
};