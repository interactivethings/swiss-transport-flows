
//      var data = d3.range(20).map(function() { return { x:Math.random()*w, y:Math.random()*h, r:Math.random()*30 } });

/*
      vis.selectAll("circle")
         .data(data)
       .enter().append("svg:circle")
         .attr("stroke", "black")
         .attr("fill", function(d, i) { return colors(i); })
         .attr("cx", function(d, i) { return d.x; })
         .attr("cy", function(d, i) { return d.y; })
         .attr("r", function(d, i) { return d.r; })
        // Here we add an SVG title element the contents of which is effectively rendered in a tooltip   
       .append("svg:title")
          .text(function(d, i) { return "My color is " + colors(i); 
          });
*/

      d3.loadData()
        .json('segments', 'data/edges-sbb.json')
        .json('stations', 'data/stations-sbb.json')
        .json('trains','../data/edge_hours.json')
        .onload(function(data) {
          var mapProj = d3.geo.mercator();
          var hour = 9;
          //mapProj.translate([0,0]);
          //mapProj.scale(1);
          
          fitProjection(mapProj, data.segments, [[0,0],[width, height]], true);

          var mapProjPath = d3.geo.path().projection(mapProj);
          vis.selectAll('path.segments')
              .data(data.segments.features)
            .enter().append('path')
              .attr('class', 'segments')
              .attr('d', mapProjPath)
              .attr('stroke', 'black')
              .attr('stroke-opacity', '.5')
              .attr('fill', 'none')
              .attr('stroke-width', function(d, i) {
                var edgeid = +d.properties.edge_id;
                var hours = data.trains[edgeid];
                if (hours !== undefined  &&  hours[hour] !== undefined) {
                var forhour = hours[hour]; 
                  return forhour.length * 2;
                }
                else
                  return 1;
              })
              ;

              /*
          vis.selectAll('path.stations')
              .data(data.stations.features)
            .enter().append('path')
              .attr('class', 'stations')
              .attr('d', mapProjPath)
              //.attr('transform', 'scale(0.5)')
              .attr('stroke', 'black')
              .attr('stroke-opacity', '.5')
              .attr('fill', 'blue');
            */

        });

