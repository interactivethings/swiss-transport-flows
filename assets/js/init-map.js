var width = window.innerWidth, height = window.innerHeight;
var vis = d3.select("#map").append("svg:svg").attr('width', width).attr('height', height);

var po = org.polymaps;
//var poMapType;

$(document).bind('stf-ready', function(){
    var curZoomLevel;
    
    // Create the map object, add it to #map…
    var map = po.map().container(vis.node())
      .zoom(8.5)
      .center({
          lat: 46.7,
          lon: 9
      }).add(po.interact());
    
    // Add the CloudMade image tiles as a base layer…
	var mapTiles;
	
    /*map.add(mapTiles /*po.image()    
	.url(po.url("http://{S}tile.cloudmade.com"
     + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
     + "/45763/256/{Z}/{X}/{Y}.png")
     .hosts(["a.", "b.", "c.", ""]))*/
    //.url("http://s3.amazonaws.com/com.modestmaps.bluemarble/{Z}-r{Y}-c{X}.jpg")
	//);
    
	
    // Add the compass control on top.
    map.add(po.compass().pan("none"));
	
	//$('g#bboxg').data('bbox');
    
    var $bboxg = $('g#bboxg'), bboxg = $bboxg.get(0);
    var $compass = $('g.compass'), compass = $compass.get(0);
    var bounds = $bboxg.data('bbox');
	//console.log(bounds);
	
	$('input[name="mapType"]').change(function() {
		var newMapTiles;
    //var val = $('input[name="mapType"]:checked').val();
    var showCities = $('#showCitiesChk:checked').val();
		//if (val == 'osm'  ||  val == 'osmlabels') {
      var style;
      if (showCities)
        style = 61319;
      else
        style = 61326;

			newMapTiles = po.image()    
			.url(po.url("http://{S}tile.cloudmade.com"
		     + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
         + "/"+style+"/256/{Z}/{X}/{Y}.png"   

           // alternative styles: 26171, 44094, 58465 (no labels), 19321 (greens and lakes), 
           //   61316 (white, water, no roads)   http://maps.cloudmade.com/editor/style/61326
           // + "/8ee2a50541944fb9bcedded5165f09d9"     // registered by Ilya 
         )
		     .hosts(["a.", "b.", "c.", ""]));
			 map.zoomRange([1, 18]);
    /*
    }
		else if(val == 'bluemarble') {
			newMapTiles = po.image()    
			.url("http://s3.amazonaws.com/com.modestmaps.bluemarble/{Z}-r{Y}-c{X}.jpg");
			map.zoomRange([0, 9]);
		}
		else {
			 map.zoomRange([1, 18]);
		}
    */
		if (newMapTiles) {
			map.add(newMapTiles);
		}
		if(mapTiles) {
			map.remove(mapTiles);
		}
		
        bboxg.parentNode.appendChild(bboxg);
		compass.parentNode.appendChild(compass);
		
		//poMapType = val;
		mapTiles = newMapTiles;
	}).change();
	
    
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
	
  $(window).resize(function() {
    move();
    vis.attr('width', window.innerWidth).attr('height', window.innerHeight);
  });

	move();
    
    function transform(d){
        d = map.locationPoint({
            lon: bounds[0][0],
            lat: bounds[1][1]
        });
        return "translate(" + d.x + "," + d.y + ")";
    }
	
	 $('#location_txt').autocomplete({
		source: function(request, response){
			$.get('http://9kl.be/locations.php?callback=?', {
				query: request.term,
				type: 'station'
			}, function(data){
				response($.map(data.stations, function(station){
					return {
						label: station.name,
						station: station
					}
				}));
			}, 'json');
		},
		select: function(event, ui){
			console.log(ui.item.station, ui.item.station.coordinate.x, ui.item.station.coordinate.y);
			map.center({
		        lat: ui.item.station.coordinate.y,
		        lon: ui.item.station.coordinate.x
		    });
			map.zoom(14);
		}
	});
	
	$('#location_btn').click(function(e) {
		e.preventDefault();
        navigator.geolocation.getCurrentPosition(function(position) {
            var x = position.coords.longitude;
            var y = position.coords.latitude;
            
            map.center({
		        lat: y,
		        lon: x
		    });
			map.zoom(12);
			$('#location_txt').val(y+','+x);
        }, function() {});
	});
});

