jQuery.preloadimages=function(arr){
    var newimages=[], loadedimages=0;
    var postaction=function(){};
    var arr=(typeof arr!="object")? [arr] : arr;
    function imageloadpost(){
        loadedimages++;
        if (loadedimages==arr.length){
            postaction(newimages);
        }
    }
    for (var i=0; i<arr.length; i++){
        newimages[i]=new Image();
        newimages[i].src=arr[i];
        if (newimages[i].complete) {
            imageloadpost();
        }else{
            newimages[i].onload=function(){
                imageloadpost();
            }
            newimages[i].onerror=function(){
                imageloadpost();
            }
        }
    }
    return {
        done:function(f){
            postaction=f || postaction;
        }
    }
};