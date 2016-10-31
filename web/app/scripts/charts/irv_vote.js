define(["d3", "data", "linq", "candidate_info", "chai", "colors"],
  (d3, data, linq, candidate_info, chai, colors) => ((main_div_id, initial_candidates, initial_candidate_names, cloning_enabled) => {

    function max_box_size_to_fit(width, height, num_boxes) {
      var n_x = 0;
      while (true) {
        n_x += 1;
        var n_y = Math.floor(num_boxes / n_x);
        var size = width / n_x;
        var total_height = n_y * size;
        if (total_height < height) {
          return size;
        }
      }
    }

    var main_div = d3.select(main_div_id);
    main_div.attr("class", "irv");

    // Chart setup
    var full_width = 700;
    var full_height = 600;
    var margin = {top: 20, right: 50, bottom: 30, left: 50};
    var width = full_width - margin.left - margin.right;
    var height = full_height - margin.top - margin.bottom;

    var graph_svg = main_div.append("svg")
      .attr("width", full_width)
      .attr("height", full_height);

    var graph = graph_svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Y-Axis Setup
    var y_scale = d3.scale.linear().range([0, height]);
    var y_axis_group = graph.append("g")
      .attr("class", "y axis");
    var y_axis = d3.svg.axis()
      .scale(y_scale)
      .orient("left")
      .ticks(0);
    y_axis_group.call(y_axis);
    graph.append("text")
      .attr("class", "axis-text")
      .style("font-size", "10pt")
      .attr("font-style", "italic")
      .attr("x", -2 * height / 3)
      .attr("y", -20)
      .attr("transform", "rotate(-90)")
      .text("number of people");

    var axis = graph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");

    main_div.append("br");

    // Set up auxiliary UI controls
    var button_next = main_div.append("a")
      .attr("class", "irv-button waves-effect waves-light btn-large")
      .text("Next");

    var button_reset = main_div.append("a")
      .attr("class", "irv-button aves-effect waves-light btn-large")
      .text("Reset");

    var color_scale = d3.scale.category10();

    // ================
    // Function is called every time we change the dataset / candidates
    // ================
    function render(data, first_candidates, candidates, candidate_names, last_bins, voter_click, needs_color_change) {
      // Analyze data
      var plurality_votes = Enumerable.From(data)
        .Select(d => d.find(el => candidates.includes(el)))
        .ToArray();

      // Data structure to map to visuals
      var data_bins = Enumerable.From(candidates)
        .Select(d => {
          return {"candidate": d, "voters": []};
        })
        .ToArray();

      // Add voters to the data structure.
      plurality_votes.forEach((elem, i) => {
        data_bins.find(d => d.candidate === elem).voters.push(i);
      });

      data_bins.forEach(bin => {
        bin.voters = bin.voters.sort((voter1, voter2) => {
          if (last_bins === undefined) {
            return voter1 - voter2;
          }

          var last_candidates = last_bins.map(bin => bin.candidate);
          var voter1_last_candidate = data[voter1].find(e => last_candidates.includes(e));
          var voter2_last_candidate = data[voter2].find(e => last_candidates.includes(e));

          // If both voters were in this bin last time, just use the last sort.
          if (voter1_last_candidate == bin.candidate && voter2_last_candidate == bin.candidate) {
            var last_bin = last_bins.find(b => b.candidate === bin.candidate).voters;
            return last_bin.indexOf(voter1) - last_bin.indexOf(voter2);
          }

          // If one voter was in this bin, but the other wasn't, place that one first.
          if (voter1_last_candidate == bin.candidate) {
            return -1;
          }

          if (voter2_last_candidate == bin.candidate) {
            return 1;
          }


          if (voter1_last_candidate != voter2_last_candidate) {
            return voter1_last_candidate - voter2_last_candidate;
          } else {
            // Both voters shared a candidate last round, so group them in the same order they were in the previous
            // candidate.
            var shared_candidate_voters = last_bins.find(b => b.candidate == voter1_last_candidate).voters;
            return shared_candidate_voters.indexOf(voter1) - shared_candidate_voters.indexOf(voter2);
          }
        });
      });

      // Sort bins by number of votes
      data_bins.sort(function (b1, b2) {
        return b1.voters.length - b2.voters.length;
      });


      //
      // Start visualization
      //
      var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .3, .15)
        .domain(first_candidates);

      var max_voters_in_column = data.length;
      var box_size = max_box_size_to_fit(x.rangeBand(), height, max_voters_in_column);
      var box_buffer = 1;
      var columns_in_bin = Math.floor(x.rangeBand() / box_size);

      // Axis
      var x_axis = fc.svg.axis()
        .scale(x)
        .tickFormat(d => candidate_names[d])
        .decorate(function (s, d) {
          var path = s.enter().append('path');
          s.select('path').attr("d", "M0,13L60,13")
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .style("display", d => {
              return data_bins.find(b => b.candidate === d) === undefined ? "" : "none";
            });

        })
        .orient("bottom");

      axis.call(x_axis);

      // Create rects for every voter
      var all_voters = graph.selectAll("rect")
        .data(plurality_votes);

      // All new voter boxes:
      all_voters.enter()
        .append("rect")
        .on("click", (candidate, voter_number) => {
          if (voter_click !== undefined) {
            voter_click(candidate, voter_number);
          }
        });

      all_voters.attr("width", box_size)
        .attr("height", box_size);

      var transition = all_voters
        .transition()
        .duration(500)
        .attr("fill", (d, i) => {
          if (last_bins === undefined) { return colors.gray; }
          var bin = data_bins.find(b => b.voters.includes(i));
          var old_bin = last_bins.find(b => b.voters.includes(i));
          return bin.candidate === old_bin.candidate ? colors.blue_teal : colors.gray;
        })

        .transition()
        .duration(1000)
        .delay(function () { return 1250 + Math.random() * 600; })
        .attr("x", (d, i) => {
          var bin = data_bins.find(b => b.candidate === d);
          var index_in_bin = bin.voters.indexOf(i);
          var result = x(bin.candidate) + (box_size + box_buffer) * (index_in_bin % columns_in_bin);
          return result;
        })
        .attr("y", function (d, i) {
          var bin = data_bins.find(b => b.candidate === d);
          var index_in_bin = bin.voters.indexOf(i);
          var y = (box_size + box_buffer) * Math.floor(index_in_bin / columns_in_bin);
          return height - y - box_size;
        });

      if (needs_color_change) {
        transition.attr("fill", function (d) {
          return colors.blue_teal;
        });
      } else {
      }

      return data_bins;
    }

    // Start of update loop.
    data.then(data => {
      var original_dataset = data.cropped_500;

      var dataset;
      var current_candidates;
      var first_candidates;
      var current_candidate_names;
      var cloned_ids;
      var bins;
      var needs_color_change = false; // true: at the next step, change voter colors to match the color they are in.

      // When a voter is clicked, clone the candidate of that voter.
      function clicked_on_voter(candidate, voter_id) {
        if (!cloning_enabled) {
          return;
        }

        cloned_ids.push(candidate);

        var candidate_data = candidate_info.get_data_with_clones(original_dataset, initial_candidates, initial_candidate_names, cloned_ids);
        dataset = candidate_data.data;
        current_candidates = candidate_data.ids.slice();
        first_candidates = candidate_data.ids.slice();
        current_candidate_names = candidate_data.names;
        needs_color_change = false;
        bins = render(dataset, first_candidates, current_candidates, current_candidate_names, undefined, clicked_on_voter, true);
      }

      // When the next button is clicked, step to the next stage in IRV
      function clicked_on_next() {
        if (!needs_color_change) {
          // Remove the candidate that has has the least votes (bins is sorted by vote).
          current_candidates.splice(current_candidates.indexOf(bins[0].candidate), 1);
        }

        // Re-render the visualization
        bins = render(dataset, first_candidates, current_candidates, current_candidate_names, bins, clicked_on_voter, needs_color_change);

        //needs_color_change = !needs_color_change;
      }

      function reset_all() {
        dataset = original_dataset;
        current_candidates = initial_candidates.slice(); // candidates still remaining in the voting
        first_candidates = initial_candidates.slice(); // the candidates in the first round of voting
        current_candidate_names = initial_candidate_names.slice();
        needs_color_change = false;
        cloned_ids = [];

        // Re-render
        bins = render(dataset, first_candidates, current_candidates, current_candidate_names, bins, clicked_on_voter, true);
      }

      // Starting parameters
      reset_all();

      button_next.on("click", clicked_on_next);
      button_reset.on("click", reset_all);
    });
  }));

