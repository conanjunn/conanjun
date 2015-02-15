jQuery.sortArr = function(arr) {
  return arr.sort(function compareFunc(param1, param2) {
    if (typeof param1 == "string" && typeof param2 == "string") {
      return param1.localeCompare(param2);
    }
    if (typeof param1 == "number" && typeof param2 == "string") {
      return -1;
    }
    if (typeof param1 == "string" && typeof param2 == "number") {
      return 1;
    }
    if (typeof param1 == "number" && typeof param2 == "number") {
      return param1 - param2;
    }
  });
};