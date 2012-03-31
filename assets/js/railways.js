var setNewProjectionSize;

(function() {

    var ColorBrewer = {
        sequential: {
          OrRd: ['rgb(255, 247, 236)', 'rgb(254, 232, 200)', 'rgb(253, 212, 158)', 'rgb(253, 187, 132)', 'rgb(252, 141, 89)', 'rgb(239, 101, 72)', 'rgb(215, 48, 31)', 'rgb(179, 0, 0)', 'rgb(127, 0, 0)']
        },
        diverging : {
          RdBu4: ["#CA0020", "#F4A582", "#92C5DE", "#0571B0"] 
        }
      };

    function domainForColors(colors, min, max) {
        var d, domain, i, _ref;
        domain = [min];
        d = (max - min) / (colors.length - 1);
        for (i = 1, _ref = colors.length - 1; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
          domain.push(min + d * i);
        }
        return domain;
    }

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
      .json('segments', 'assets/data/edges-sbb.json')
      .json('stations', 'assets/data/stations-sbb.json')
      .json('boundary', 'data/switzerland_boundaries.json')
      .json('trains',  'data/edge_hours_compressed.json')
      .json('stationTrainsByHour',  'data/station_hours_compressed.json')
      .json('speeds',  'data/avg_speeds_per_edge.json')
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

      
      var speedColorScale = d3.scale.linear()
        .domain([0, d3.max(d3.values(data.speeds))])
       //  .range(["blue", "red"]);
        .range(["#0571B0", "#CA0020"]);
      
      /*
      var speedColorScale = 
        d3.scale.log().domain(
          domainForColors(
            ColorBrewer.diverging.RdBu4, 1, 
             d3.max(d3.values(data.speeds)))).range(
          ColorBrewer.diverging.RdBu4);
      */

      $("#time_slider")
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

        $("#time_slider").slider.prototype.nextStep = function() {
            console.log("called next step");
            if(value < max){
                 this.slider( "option" , "value", value + step);
             }else{
                 this.slider( "option" , "value", min);
             }
        };

        var animateSlider = (function(){
            var s = $("#time_slider");
            var p = $("#time_play_btn");

            var running = false;


            function toggle() {
                console.log("toggleling" + running);
                if(running){
                    stop();
                    p.removeClass("running");
                }else{
                    start();
                    p.addClass("running");
                  }
            };

            function start() {
                running = true;
                p.val("pause");
                run();
                p.addClass("running");
            };

            function stop() {
                running = false;
                p.val("play");
                p.removeClass("running");
            };

            function run() {
                console.log("called running");
                if (!running)
                    return;

                var sValue = s.slider( "option" , "value" );
                var sMin = s.slider( "option" , "min" );
                var sMax = s.slider( "option" , "max" );
                var sStep = s.slider( "option" , "step" );

                if(sValue < sMax){
                     s.slider( "option" , "value", sValue + sStep);
                 }else{
                     s.slider( "option" , "value", sMin);
                 }
                 setTimeout(run, 1000);
            }

            return {
                toggle: toggle
            };
        })();


         $("#time_play_btn").click(  function(e, ui) {
                animateSlider.toggle();
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
        return +$("#time_slider").slider("option", "value");
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
              .attr('stroke', function(d, i) {
                var edgeid = +d.properties.edge_id;
                return speedColorScale(data.speeds[edgeid]);
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

      $('svg path.segments').tipsy({
        gravity: 'w',
        html: true,
        title: function() {
          var d = this.__data__.properties;
          var edgeid = +d.edge_id;
          return getTrainCount(edgeid, getSelectedHour()) + ' trains<br>' +
                'Avg speed: ' + data.speeds[edgeid] + ' km/h';
        }
      });

      releaseMap();

    });

    function releaseMap() {
      $('#overlay').hide();
      var logoPos = $('#logo').position();
      $('#logo')
        .css('top', logoPos.top)
        .css('right', $(window).width() - logoPos.left - $('#logo').width() / 2)
        .animate({
            top: '15px',
            right: '52px',
            marginRight: '0',
            marginTop: '0'
          }, 1800, function() {
            $(this).animate({
              top: '20px',
              right: '57px'
            }, 100)
          // Animation complete.
      });
      $('#panel')
        .animate({
          top: '266'
        }, 1800)
    }

})();
