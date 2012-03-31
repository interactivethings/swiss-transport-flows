var width = window.innerWidth, height = 600;
var vis = d3.select("#map").append("svg:svg").attr('width', width).attr('height', height);

var po = org.polymaps;

$(document).bind('stf-ready', function(){
    var curZoomLevel;
    
    // Create the map object, add it to #map…
    var map = po.map().container(vis.node()).zoom(8).center({
        lat: 46.801111,
        lon: 8.226667
    }).add(po.interact());
    
    // Add the CloudMade image tiles as a base layer…
    map.add(po.image()    
	.url(po.url("http://{S}tile.cloudmade.com"
     + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
     + "/58465/256/{Z}/{X}/{Y}.png")
     .hosts(["a.", "b.", "c.", ""]))
    //.url("http://s3.amazonaws.com/com.modestmaps.bluemarble/{Z}-r{Y}-c{X}.jpg")
	);
    
    // Add the compass control on top.
    map.add(po.compass().pan("none"));
    
    vis.selectAll("path.segments")
    
    //$('g#bboxg').data('bbox');
    
    var $bboxg = $('g#bboxg'), bboxg = $bboxg.get(0);
    var $compass = $('g.compass'), compass = $compass.get(0);
    var bounds = $bboxg.data('bbox');
    
    var zoomChange = function(){
        var topLeft = map.locationPoint({
            lon: bounds[0][0],
            lat: bounds[1][1]
        });
        var bottomRight = map.locationPoint({
            lon: bounds[1][0],
            lat: bounds[0][1]
        });
        //console.log(bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
        setNewProjectionSize(bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
        bboxg.parentNode.appendChild(bboxg);
		compass.parentNode.appendChild(compass);
    };
    
	var move = function() {
		vis.select("g#bboxg").attr("transform", transform);
        
        var newZoomLevel = map.zoom();
        if (newZoomLevel != curZoomLevel) {
            zoomChange();
            curZoomLevel = newZoomLevel;
        }
	}
	
    map.on("move", move);
	
	move();
    
    function transform(d){
        d = map.locationPoint({
            lon: bounds[0][0],
            lat: bounds[1][1]
        });
        return "translate(" + d.x + "," + d.y + ")";
    }
});

