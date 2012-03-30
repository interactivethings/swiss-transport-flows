var setNewProjectionSize;

(function() {


    function bbox(data) {
      var left = Infinity,
          bottom = -Infinity,
          right = -Infinity,
          top = Infinity;
      data.segments.features.forEach(function(feature) {
          d3.geo.bounds(feature).forEach(function(coords) {
              var x = coords[0],
                  y = coords[1];
              if (x < left) left = x;
              if (x > right) right = x;
              if (y > bottom) bottom = y;
              if (y < top) top = y;
          });
      });
      //console.log(left, right, bottom, top);
      return [[left,top], [right,bottom]];
    }

    d3.loadData()
      .json('segments', 'data/edges-sbb.json')
      .json('stations', 'data/stations-sbb.json')
      .json('boundary', '../data/switzerland_boundaries.json')
      .json('trains',  '../data/edge_hours_compressed.json')
     // .json('stations',  '../data/station_hours.json')
      .onload(function(data) {
        var outerg = vis.append('g').attr('id', 'bboxg');
        var mapProj = d3.geo.mercator();
        //mapProj.translate([0,0]);
        //mapProj.scale(1);



    setNewProjectionSize = function(width, height) {
    	fitProjection(mapProj, data.segments, [[0,0],[width, height]], true);
			if(update) update();
		}
		setNewProjectionSize(width, height);

  
      
      $('g#bboxg').data('bbox', bbox(data));
  		$(document).trigger('stf-ready');

      var mapProjPath = d3.geo.path().projection(mapProj);


      outerg.selectAll("path")           
          .data(data.boundary.features)
      .enter().append("path") 
          .attr("d", mapProjPath)
          .attr("fill", "rgb(230,230,230)")
          .attr("stroke", "rgb(200,200,200)")
          .attr("stroke-width", "0.5");


      outerg.selectAll('path.segments')
          .data(data.segments.features)
        .enter().append('path')
          .attr('class', 'segments')
          .attr('stroke', 'black')
          //.attr('stroke-opacity', '.5')
          .attr('fill', 'none')
          ;


          /*
      outerg.selectAll('path.stations')
          .data(data.stations.features)
        .enter().append('circle')
          .attr('class', 'stations')
          .attr('cx', function(d) { return mapProj(d.geometry.coordinates)[0]; })
          .attr('cy', function(d) { return mapProj(d.geometry.coordinates)[1]; })
          .attr('r', 1)
          .attr('stroke', 'blue')
          .attr('opacity', '.5')
          //.attr('fill', 'blue')
          ;
          */

        


      $("#slider")
        .slider({ 
          orientation: 'horizontal',
          min: 0,
          max: 23,
          value: 9,
          step: 1,
          change: function(e, ui) {
            update();
          }
        });

      function update() {

        var hour = +$("#slider").slider("option", "value");
        var hourText = hour + ':00 - ' + (hour+1) + ':00';
        $('#hourLabel').html(hourText);

        function getTrainCount(edgeid, hour) {
          var hours = data.trains[edgeid];
          if (hours !== undefined  &&  hours[hour] !== undefined) {
            return hours[hour];
          }
          return 0;
        }

        outerg.selectAll('path.segments')
          .attr('d', mapProjPath)
          .transition()
            .duration(500)
            .attr('stroke-width', function(d, i) {
              var edgeid = +d.properties.edge_id;
              return 0.1 + (getTrainCount(edgeid, hour) + getTrainCount(-edgeid, hour))/2;
            });
      }

      update();

    });



})();
