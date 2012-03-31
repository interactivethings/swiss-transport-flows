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
      .json('stationTrainsByHour',  '../data/station_hours_compressed.json')
      .json('speeds',  '../data/avg_speeds_per_edge.json')
      .onload(function(data) {
        var outerg = vis.append('g').attr('id', 'bboxg');
        var mapProj = d3.geo.mercator();
        //mapProj.translate([0,0]);
        //mapProj.scale(1);



    setNewProjectionSize = function(width, height) {
    	fitProjection(mapProj, data.segments, [[0,0],[width, height]], true);
			if(updateProjection) updateProjection();
		}
		setNewProjectionSize(width, height);

/*
      var speedColorScale = d3.scale.linear()
        .domain([-1, 0, 1])
        .range(["red", "white", "green"]);
  */    

      $("#slider")
        .slider({ 
          orientation: 'horizontal',
          min: 0,
          max: 23,
          value: 9,
          step: 1,
          change: function(e, ui) {
            updateHour();
          }
        });


      $('g#bboxg').data('bbox', bbox(data));
  		$(document).trigger('stf-ready');

      var mapProjPath = d3.geo.path().projection(mapProj);


      outerg.selectAll("path")           
          .data(data.boundary.features)
      .enter().append("path") 
          .attr("class", "boundary")
          .attr("d", mapProjPath)
          .attr("fill", "rgb(230,230,230)")
          .attr("stroke", "rgb(200,200,200)")
          .attr("stroke-width", "0.5");


      var segmentsGroup = outerg.append("g").attr('class','segments');;
      segmentsGroup.selectAll('path.segments')
          .data(data.segments.features)
        .enter().append('path')
          .attr('class', 'segments')
          .attr('stroke', 'black')
          //.attr('stroke-opacity', '.5')
          .attr('fill', 'none')
          ;

        function getTrainCount(edgeid, hour) {
          var hours = data.trains[edgeid];
          if (hours !== undefined  &&  hours[hour] !== undefined) {
            return hours[hour];
          }
          return 0;
        }

        function getStationTrainCount(stationid, hour) {
          var hours = data.stationTrainsByHour[stationid];
          if (hours !== undefined  &&  hours[hour] !== undefined) {
            return hours[hour];
          }
          return 0;
        }

      var stationsGroup = outerg.append("g").attr('class','stations');
      stationsGroup.selectAll('circle.stations')
          .data(data.stations.features)
        .enter().append('circle')
          .attr('class', 'stations')
          /*
          .sort(function(d) {
            var station_id = +d.properties.station_id;
            return getStationTrainCount(station_id, getSelectedHour());
          }) */;

        

      function getSelectedHour() {
        return +$("#slider").slider("option", "value");
      }

      function updateVisibility() {
        updateHour(true);
        outerg.selectAll('g.stations')
          .attr("visibility", $('#showStationsChk').is(':checked') ? 'visible' : 'hidden');
        outerg.selectAll('g.segments')
          .attr("visibility", $('#showRailwaysChk').is(':checked') ? 'visible' : 'hidden');
      }
      $('#showStationsChk').click(function() { updateVisibility(); });
      $('#showRailwaysChk').click(function() { updateVisibility(); });

      function updateProjection() {
        outerg.selectAll('path.segments')
          .attr('d', mapProjPath);

        outerg.selectAll('circle.stations')
          .attr('cx', function(d) { return mapProj(d.geometry.coordinates)[0]; })
          .attr('cy', function(d) { return mapProj(d.geometry.coordinates)[1]; })
          ;
        outerg.selectAll("path.boundary")
            .attr("d", mapProjPath);
      }


      function updateHour(force) {
        var hour = getSelectedHour();
        var hourText = hour + ':00 - ' + (hour+1) + ':00';
        $('#hourLabel').html(hourText);

        var segmentsGroup = outerg.selectAll('g.segments');
        if (force || segmentsGroup.attr('visibility') != 'hidden') {
          outerg.selectAll('path.segments')
            .transition()
              .duration(force ? 0 : 500)
              .attr('stroke-width', function(d, i) {
                var edgeid = +d.properties.edge_id;
                return 0.1 + 
                  (getTrainCount(edgeid, hour) + getTrainCount(-edgeid, hour))/3;
              })
              .attr('stroke-color', function(d, i) {
                var edgeid = +d.properties.edge_id;
                data.speeds[edgeid]
              })
              ;
          }

        var stationsGroup = outerg.selectAll('g.stations');
        if (force || stationsGroup.attr('visibility') != 'hidden') {
          outerg.selectAll('circle.stations')
            .transition()
              .duration(force ? 0 : 500)
              .attr('r', function(d, i) {
                var station_id = +d.properties.station_id;
                return 0.1 + Math.sqrt(getStationTrainCount(station_id, getSelectedHour()));
              });
        }
      }

      updateProjection();
      updateHour();

      $('svg circle.stations').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          var d = this.__data__.properties;
          return d.name + '<br>' + getStationTrainCount(d.station_id, getSelectedHour()) + ' trains'; 
        }
      });

    });



})();
