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
      .json('trains','../data/edge_hours.json')
      .onload(function(data) {
        var outerg = vis.append('g').attr('id', 'bboxg');
        var mapProj = d3.geo.mercator();
        //mapProj.translate([0,0]);
        //mapProj.scale(1);



        
        fitProjection(mapProj, data.segments, [[0,0],[width, height]], true);
        
        $('g#bboxg').data('bbox', bbox(data));


        var mapProjPath = d3.geo.path().projection(mapProj);
        outerg.selectAll('path.segments')
            .data(data.segments.features)
          .enter().append('path')
            .attr('class', 'segments')
            .attr('d', mapProjPath)
            .attr('stroke', 'black')
            //.attr('stroke-opacity', '.5')
            .attr('fill', 'none')
            ;



            /*
        outerg.selectAll('path.stations')
            .data(data.stations.features)
          .enter().append('path')
            .attr('class', 'stations')
            .attr('d', mapProjPath)
            //.attr('transform', 'scale(0.5)')
            .attr('stroke', 'black')
            .attr('stroke-opacity', '.5')
            .attr('fill', 'blue');
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
              var forhour = hours[hour]; 
              return forhour.length * 2;
            }
            return 0;
          }

          outerg.selectAll('path.segments')
            .transition()
              .duration(500)
              .attr('stroke-width', function(d, i) {
                var edgeid = +d.properties.edge_id;
                return 0 + getTrainCount(edgeid, hour) + getTrainCount(-edgeid, hour);
              });
        }

        update();

      });



})();
