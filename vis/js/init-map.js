var width = 900, height = 600;
var vis = d3.select("#map").append("svg:svg").attr('width', width).attr('height', height);

var po = org.polymaps;

// Create the map object, add it to #map…
var map = po.map()
    .container(vis.node())
    .zoom(8)
	.center({lat:46.801111, lon:8.226667})
    .add(po.interact());

// Add the CloudMade image tiles as a base layer…
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
    + "/45763/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""]))
	//.url("http://s3.amazonaws.com/com.modestmaps.bluemarble/{Z}-r{Y}-c{X}.jpg")
	);

// Add the compass control on top.
map.add(po.compass()
    .pan("none"));

vis.selectAll("path.segments")

map.on("move", function() {
   // vis.selectAll("path.segments").attr("transform", transform);
});

function transform(d) {
	console.log(d);
	d = map.locationPoint({lon:d.value[0], lat:d.value[1]});
	//return "translate(" + d.x + "," + d.y + ")";
}