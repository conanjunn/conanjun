;(function($, d3) {
    var D3Map = function(options) {
        var $_width = Math.max($(window).width(), 980);
        var $width = $_width*0.75-20;
        var defaults = {
            mapWidth: $width,
            mapHeight: $width*0.66666667,
            cityColor: "#429dd4",
            provinceColor: "#FD9602",
            mouseOverColor: "#feb41c",
            selectedColor: "rgba(205,20,242,.3)",

            strokeColor:"#0D1624",
            defaultProvinceColor: "rgba(205,20,242,0.4)",
            defaultMouseOverColor: "rgba(205,20,242,0.5)",

            top20ProvinceColor: "rgba(205,20,242,0.6)",
            top20MouseOverColor: "rgba(205,20,242,0.7)",

            top10ProvinceColor: "rgba(205,20,242,0.9)",
            top10MouseOverColor: "rgba(205,20,242,1)",

            top5ProvinceColor: "rgba(253,150,2,0.9)",
            top5MouseOverColor: "rgba(253,150,2,1)",


            selector: "body",
            selectedArea: "",
            geoJSON: null,
            change: $.noop
        };
        options = $.extend(defaults, options);
        if (!options.geoJSON) {
            throw new Error("miss param geoJSON");
        }
        this._init(options);
        return this;
    }

    D3Map.prototype._getTipPos = function(e) {
        var mouseX;
        var mouseY;
        var tipWidth = $('.mapTip').outerWidth();
        var tipHeight = $('.mapTip').outerHeight();
        if (e && e.pageX) {
            mouseX = e.pageX;
            mouseY = e.pageY;
        } else {
            mouseX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            mouseY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        var tipX = mouseX - tipWidth/2 < 0 ? 0 : mouseX - tipWidth/2;
        var tipY = mouseY - tipHeight - 10 < 0 ? mouseY + 10 : mouseY - tipHeight - 10;
        return [tipX, tipY];
    }

    D3Map.prototype._init = function(options) {
        var self = this;
        var mapWidth = options.mapWidth;
        var mapHeight = options.mapHeight;
        var cityColor = options.cityColor;
        var provinceColor = options.provinceColor;
        var mouseOverColor = options.mouseOverColor;
        var selectedColor = options.selectedColor;
        var selectedArea5 = options.selectedArea5.split(",");
        var selector = options.selector;
        var projection = d3.geo.albers()
        .scale(mapWidth)
        .translate([mapWidth / 2, mapHeight / 2])
        .rotate([-105, 0])
        .center([0, 36])
        .parallels([27, 45]);
        var path = d3.geo.path().projection(projection);
        var svg = d3.select(selector)
        .append("svg")
        .attr({
            "width": mapWidth,
            "height": mapHeight
        });

        $(selector).on("GEOJSON_DONE", function(event, json) {
            svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke", options.strokeColor)
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .attr("data-type", function(data) {
                return data.properties.type;
            })
            .attr("data-province", function(data) {
                return data.properties.province;
            })
            .attr("data-name", function(data) {
                return data.properties.name;
            })
            .attr("fill", function(data) {
                var path = d3.select(this);
                if (data.properties.type === "city") {
                    var str = data.properties.province + "|" + data.properties.name;
                    return selectedArea5.indexOf(str) !== -1 || path.attr("data-selected") == "true" ? (path.attr("data-selected", "true"), selectedColor) : cityColor;
                }
                else {
                    var str = data.properties.province;
                    if (selectedArea5.indexOf(str) !== -1) {
                        d3.selectAll("[data-province=" + data.properties.name + "]")
                        .attr("data-s5", "true")
                        .attr("fill", options.top5ProvinceColor);
                        return options.top5ProvinceColor;
                    }else if(options.selectedArea10.indexOf(str) !== -1) {
                        d3.selectAll("[data-province=" + data.properties.name + "]")
                        .attr("data-s10", "true")
                        .attr("fill", options.top10ProvinceColor);
                        return options.top10ProvinceColor;
                    }else if (options.selectedArea20.indexOf(str) !== -1){
                        d3.selectAll("[data-province=" + data.properties.name + "]")
                        .attr("data-s20", "true")
                        .attr("fill", options.top20ProvinceColor);
                        return options.top20ProvinceColor;
                    }
                    else {
                        return options.defaultProvinceColor;
                    }
                }
            })
            .on("mouseover", function(data) {
                var path = d3.select(this);
                if (path.attr("data-s5") == "true") {
                    path.transition().attr("fill", options.top5MouseOverColor );
                }else if(path.attr("data-s10") == "true"){
                    path.transition().attr("fill", options.top10MouseOverColor );
                }else if(path.attr("data-s20") == "true"){
                    path.transition().attr("fill", options.top20MouseOverColor );
                }else {
                    path.transition().attr("fill", options.defaultMouseOverColor );
                }
            })
            .on("mousemove", function(data) {
                var thisName = {};
                for (var i = 0,l=window.xy.xydata.length; i < l ; i++) {
                    if (data.properties.name == window.xy.xydata[i].name){
                        thisName = window.xy.xydata[i];
                        break;
                    }
                }
                if ($('.mapTip').length == 0) {
                    $(document.body).append('<div class="mapTip"></div');
                }

                var HTML = '<p style="margin-bottom:.5em;">'+data.properties.name+'</p>'+
                            '<p>访问人次: '+thisName.pv+'</p>'+
                            '<p>访问人数: '+thisName.uv+'</p>'+
                            '<p>注册人数: '+thisName.register+'</p>';
                $('.mapTip').html(HTML);
                var xy = self._getTipPos(d3.event);
                $('.mapTip').css({
                    left: xy[0],
                    top: xy[1]
                }).show();
            })
            .on("mouseout", function(data) {
                var path = d3.select(this);
               var path = d3.select(this);
                if (path.attr("data-s5") == "true") {
                    path.transition().attr("fill", options.top5ProvinceColor );
                }else if(path.attr("data-s10") == "true"){
                     path.transition().attr("fill", options.top10ProvinceColor );
                }else if(path.attr("data-s20") == "true"){
                    path.transition().attr("fill", options.top20ProvinceColor );
                }else {
                    path.transition().attr("fill", options.defaultProvinceColor );
                }
                $('.mapTip').hide();
            })
        });

        if ($.isPlainObject(options.geoJSON)) {
            $(selector).trigger("GEOJSON_DONE", options.geoJSON);
        }
        else {
            d3.json(options.geoJSON, function(json) {
                $(selector).trigger("GEOJSON_DONE", json);
            })
        }
    }

    $.D3Map = function (options) {
        return new D3Map(options);
    }

    if ("function" == typeof define && define.amd) {
        define(["jquery", "d3"], function(require, exports, module) {
            return D3Map;
        });
    }
    else {
        window.D3Map = D3Map;
    }
})(jQuery, d3);