define(["d3", "data", "linq", "candidate_info", "chai", "colors"],
  (d3, data, linq, candidate_info, chai, colors) => ((candidates, candidate_names) => {
    var expect = chai.expect;

    var main_div = d3.select('#candidate_breakdown');

    data
      .then(data => {
        // Analyze data
        var breakdowns = [];
        for (var i = 0; i < candidates.length; i++) {
          var candidate = candidates[i];
          var breakdown = Enumerable.From(data.raw)
            .Select(d => d.filter(x => candidates.includes(x)))
            .Select(d => d.indexOf(candidate))
            .GroupBy(d => d)
            .Select(d => {
              return {preference: d.ElementAt(0), count: d.Count()};
            })
            .OrderBy(d => d.preference)
            .ToArray();


          breakdowns.push({
            candidate: candidate,
            candidate_name: candidate_names[candidate],
            breakdown: breakdown
          });
        }

        // Setup up the large breakdown UI
        var full_width = 500;
        var full_height = 400;
        var margin = {top: 20, right: 50, bottom: 50, left: 50};
        var width = full_width - margin.left - margin.right;
        var height = full_height - margin.top - margin.bottom;
        var linear_colors = d3.scale.linear()
          .domain([0, candidates.length - 1])
          .range([colors.blue, colors.silver])
          .interpolate(d3.interpolateHcl);

        var graph_svg = main_div.append("svg")
          .attr("width", full_width)
          .attr("height", full_height);

        var graph = graph_svg
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Axis for each group
        var group_x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1);
        var group_y = d3.scale.linear()
          .range([height, 0]);


        var x_axis_group = graph.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")");


        var y_axis_group = graph.append("g")
          .attr("class", "y axis");


        graph.append("text")
          .attr("class", "axis-text")
          .text("Strongly in favor")
          .style("font-size", "10pt")
          .attr("transform", "translate(10, " + (height + 20) + ")");

        graph.append("text")
          .attr("class", "axis-text")
          .text("Strongly opposed")
          .style("font-size", "10pt")
          .attr("transform", "translate(" + 300 + ", " + (height + 20) + ")");


        graph.append("text")
          .attr("class", "axis-text")
          .style("font-size", "10pt")
          .attr("x", -2 * height / 3)
          .attr("y", -40)
          .attr("transform", "rotate(-90)")
          .text("number of people");

        // Setup gradients
        var defs = graph_svg.append("defs");


        // Update the large breakdown UI to show a specific candidate's breakdown.
        function large_breakdown(breakdown) {
          // Render chart


          var x2 = Array(candidates.length).fill().map((_, i)=>i);
          group_x.domain(x2);
          group_y.domain([0, d3.max(breakdown.breakdown.map(d => d.count))]);


          var x_axis = fc.svg.axis()
            .scale(group_x)
            .decorate(s => s.enter().select('text')
              .style("display", "none"))
            .orient("bottom");

          var y_axis = d3.svg.axis()
            .scale(group_y)
            .orient("left")
            .ticks(5);

          x_axis_group.transition().call(x_axis);
          y_axis_group.transition().call(y_axis);

          // Setup bar gradients
          var gradient_function = d3.interpolateHcl(colors.blue_teal, colors.white);
          var gradient_colors = Array(10).fill().map((_, i)=>gradient_function(i / 10));
          var gradients = defs.selectAll("linearGradient").data(breakdown.breakdown);

          gradients.enter()
            .append("linearGradient");

          gradients.attr("id", (_, i) => "gradient" + i)
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%")
            .attr("spreadMethod", "pad");

          // Append colors along the gradient
          var stops = gradients.selectAll(".stop")
            .data(gradient_colors);

          stops.enter().append("stop");

          stops
            .attr("offset", function (d, i) {
              return i / (gradient_colors.length - 1);
            })
            .attr("stop-color", function (d) {
              return d;
            });

          var temp_max = 1500;
          gradients.attr("y2", d => 1 + -1 / (d.count / temp_max));


          var bars = graph.selectAll(".bar")
            .data(breakdown.breakdown);


          bars.enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => group_x(i))
            .attr("width", group_x.rangeBand())
            //.attr("fill", (_, i) => linear_colors(i))
            .style("fill", (_, i) => "url(#gradient" + i + ")");

          bars
            .transition()
            .delay((_, i) => i * 40)
            .duration(750)
            .ease("cubic-out")
            .attr("height", d => height - group_y(d.count))
            .attr("y", d => group_y(d.count));


          // Draw number labels for each bar
          var labels = graph.selectAll(".bar-label").data(d3.range(breakdown.breakdown.length));
          labels.enter().append("text")
            .attr("class", "bar-label")
            .attr("text-anchor", "middle")
            .attr("fill", colors.white)
            .attr("x", d => group_x(d) + group_x.rangeBand() / 2)
            .attr("y", height - 20)
            .text(d => d + 1);

        }

        function small_breakdowns() {
          // Render chart
          var full_width = 500;
          var full_height = 80;
          var margin = {top: 0, right: 50, bottom: 20, left: 50};
          var width = full_width - margin.left - margin.right;
          var height = full_height - margin.top - margin.bottom;
          var linear_colors = d3.scale.linear()
            .domain([0, candidates.length - 1])
            .range([colors.blue, colors.silver])
            .interpolate(d3.interpolateHcl);

          var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);


          var x_axis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

          var graph_svg = main_div.append("svg")
            .attr("width", full_width)
            .attr("height", full_height);

          var graph = graph_svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          x.domain(breakdowns.map(d => d.candidate_name));

          graph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis);

          //groups
          var groups = graph.selectAll(".candidate_group")
            .data(breakdowns);

          groups.enter().append("g")
            .attr("class", "candidate_group")
            .attr("x", d => x(d.candidate_name))
            .attr("y", height)
            .attr("transform", d => "translate(" + x(d.candidate_name) + ", 0)")
            .attr("width", x.rangeBand())
            .attr("height", 50)
            .style("background-color", "red")
            .on("click", d => {
              large_breakdown(d);
            });

          // Axis for each group
          var group_x = d3.scale.ordinal()
            .rangeRoundBands([0, x.rangeBand()], .1);
          var group_y = d3.scale.linear()
            .range([height, 0]);

          var x2 = Array(candidates.length).fill().map((_, i)=>i);
          group_x.domain(x2);
          group_y.domain([0, d3.max(
            [].concat.apply([],
              breakdowns.map(e => e.breakdown.map(d => d.count))))]);

          groups.selectAll(".bar")
            .data(function (d) {
              return d.breakdown;
            })
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => group_x(i))
            .attr("y", d => group_y(d.count))
            .attr("width", group_x.rangeBand())
            .attr("fill", (_, i) => linear_colors(i))
            //.attr("height", 0)

            /*.transition()
             .delay((_, i) => i * 40)
             .duration(750)
             .ease("cubic-out")
             .attr("y", d => y(d.count))*/
            .attr("height", d => height - group_y(d.count))
          ;
        }


        large_breakdown(breakdowns[candidate_names.indexOf("sea urchin")]);
        small_breakdowns();
      });

  }));


