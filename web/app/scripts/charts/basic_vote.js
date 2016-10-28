define(["d3", "data", "linq", "candidate_info", "chai", "colors"],
  (d3, data, linq, candidate_info, chai, colors) =>
    (main_div_selector, initial_candidates, initial_candidate_names, enable_clones) => {
      var expect = chai.expect;

      //todo: the inherent randomness in how votes are doled out to clones means clones can randomly be 
      // not very precisely the same vote count as their original. We should spread these out manually to be a max
      // difference of one vote.

      var main_div = d3.select(main_div_selector);
      var cloned_ids = [];
      var category_colors = d3.scale.category20();
      var all_data;

      // Set the data and update when we get it
      data.then(datas => {
        all_data = datas;
        update();
      });

      // Render setup
      var full_width = 700;
      var full_height = 400;
      var margin = {top: 20, right: 50, bottom: 100, left: 50};
      var width = full_width - margin.left - margin.right;
      var height = full_height - margin.top - margin.bottom;
      var graph_svg = main_div.append("svg")
        .attr("width", full_width)
        .attr("height", full_height);
      var graph = graph_svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .3);

      var y = d3.scale.linear()
        .range([height, 0]);

      var x_axis = fc.svg.axis()
        .scale(x)
        .orient("bottom");

      var axis_names = graph.append("g");
      axis_names
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");


      // Main function called every time candidate data changes
      function update() {
        var candidate_data = candidate_info.get_data_with_clones(all_data.raw, initial_candidates, initial_candidate_names, cloned_ids);
        var candidates = candidate_data.ids;
        var candidate_names = candidate_data.names;
        var data = candidate_data.data;

        // Analyze data
        var plurality_votes = Enumerable.From(data)
          .GroupBy(d => d.find(el => candidates.includes(el)))
          .Select(d => {
            return {
              candidate: d.Key(),
              name: candidate_names[d.Key()],
              count: d.Count()
            }
          })
          .OrderBy(d => d.candidate)
          .ToArray();

        expect(plurality_votes.map(d => d.candidate)).to.deep.equal(candidates);
        expect(plurality_votes.reduce((a, b) => a + b.count, 0))
          .to.equal(data.length);

        // Render chart
        x.domain(plurality_votes.map(d => d.name));
        y.domain([0, d3.max(plurality_votes, d => d.count)]);
        
        axis_names.call(x_axis);

        var bar = graph.selectAll(".bar").data(plurality_votes);

        // ENTER
        bar.enter().append("rect")
          .attr("y", height)
          .attr("fill", d => {
            if (!enable_clones) {
              return colors.blue_teal;
            }

            var candidate_id_to_search = d.candidate;

            // Update candidate_id if we find that it's currently pointing to a clone.
            do {
              var possible_clone = candidate_data.clones.find(c => c.new_id === candidate_id_to_search);
              if (possible_clone !== undefined) {
                candidate_id_to_search = possible_clone.cloned_id;
              }
            } while (possible_clone !== undefined);

            // The id of the first candidate we get to that is not a clone.
            return category_colors(candidate_id_to_search);
          })
          .attr("height", 0);

        // UPDATE
        bar
          .attr("class", "bar")
          .attr("x", d => x(d.name))
          .attr("width", x.rangeBand());

        bar.transition()
          .delay((_, i) => i * 40)
          .duration(750)
          .ease("cubic-out")
          .attr("y", d => y(d.count))
          .attr("height", d => height - y(d.count));

        bar.on("click", d => {
          cloned_ids.push(d.candidate);
          update();
        });


      }
    });

