define(["d3", "data", "linq", "candidate_info", "chai", "colors", "d3_transform", "path"],
  (d3, data, linq, candidate_info, chai, colors, d3_transform, _) =>
    (main_div_selector) => {
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
        all_data = datas.cropped_500;
        all_data = all_data.map(d => d.filter(e => candidate_info.basic.ids.includes(e)));
        setup_chart();
      });

      function setup_chart() {
        var full_width = 700;
        var full_height = 400;
        var margin = {top: 50, right: 150, bottom: 50, left: 50};
        var width = full_width - margin.left - margin.right;
        var height = full_height - margin.top - margin.bottom;
        var graph_svg = main_div.append("svg")
          .attr("width", full_width)
          .attr("height", full_height);
        var graph = graph_svg
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var legend = graph.append("g");

        var block_spacing_vertical = height / all_data[0].length;
        var block_spacing_horizontal = block_spacing_vertical * 1.5;
        var block_padding = 23;
        var block_size = Math.min(block_spacing_horizontal, block_spacing_vertical) - block_padding;
        var num_columns = width / block_spacing_horizontal;

        // Setup data
        var shown_data = all_data.slice(0, num_columns);

        // Main function called every time candidate data changes
        function update() {
          var columns = graph.selectAll("g .column").data(shown_data);
          columns.enter().append("g");

          columns.attr("class", "column");
          columns.attr("transform", (_, i) => "translate(" + i * block_spacing_horizontal + ")");
          var block_columns = columns.filter((_, i) => i <= num_columns / 3 || i >= 2 * num_columns / 3);

          //
          // Draw blocks
          //
          var blocks = block_columns.selectAll("rect").data(d => d); // Bind sub data to sub groups
          blocks.enter().append("rect");

          blocks.attr("y", (_, i) => i * block_spacing_vertical);
          blocks.attr("width", block_size);
          blocks.attr("height", block_size);
          blocks.attr("fill", d => colors.candidates_categorical(d));
          blocks.attr("candidate", d => d); // Add the candidate as an attribute

          // Add border on similar elements on hover
          function add_border_for_candidate(candidate) {
            graph.selectAll("rect[candidate='" + candidate + "']")
              .attr("stroke", colors.black)
              .attr("stroke-width", 3);
          }

          function remove_border_for_candidate(candidate) {
            graph.selectAll("rect[candidate='" + candidate + "']")
              .attr("stroke", colors.transparent);
          }

          blocks.on("mouseover", d => add_border_for_candidate(d));
          blocks.on("mouseout", d => remove_border_for_candidate(d));

          // Draw elipsis for the hidden middle columns
          var ellipsis_column = columns.filter((_, i) => i == Math.floor(num_columns / 2));
          ellipsis_column.append("text")
            .attr("y", height / 2)
            .style("font-size", "40pt")
            .attr("fill", colors.gray)
            .text("...");

          //
          // Draw the legend
          //
          var legend_x_position = width;
          legend.attr("transform", "translate(" + width + ", 0)");
          var legend_blocks = legend.selectAll("g").data(shown_data[0].slice());
          var group = legend_blocks.enter().append("g");

          // Divider
          var legend_divider_x_position = -30;
          var p = path();
          p.moveTo(legend_divider_x_position, 15);
          p.lineTo(legend_divider_x_position, height - 15);
          legend.append("path")
            .attr("d", p.toString())
            .attr("stroke", colors.gray)
            .attr("stroke-width", .3);

          // Label
          var text = group.append("text")
            .attr("y", (_, i) => i * block_spacing_vertical + 10)
            .attr("x", block_spacing_horizontal)
            .text(d => candidate_info.basic.names[d]);


          // Block
          group.append("rect")
            .attr("y", (_, i) => i * block_spacing_vertical)
            .attr("width", block_size)
            .attr("height", block_size)
            .attr("fill", d => colors.candidates_categorical(d))
            .attr("candidate", d => d) // Add the candidate as an attribute
            .on("mouseover", d => add_border_for_candidate(d))
            .on("mouseout", d => remove_border_for_candidate(d));

          //
          // Draw left axis and bottom label
          //
          var y_labels = graph.append("g");
          var labels = y_labels.selectAll("text").data(d3.range(shown_data[0].length));
          labels.enter().append("text")
            .attr("y", (_, i) => i * block_spacing_vertical + block_size / 2)
            .attr("x", -30)
            .attr("fill", colors.gray)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .text(d => d + 1);

          graph.append("text")
            .attr("x", width / 2)
            .attr("y", height + 35)
            .attr("text-anchor", "middle")
            .text("Sushi Rankings of Japanese Voters");

        }

        update();
      }
    });

