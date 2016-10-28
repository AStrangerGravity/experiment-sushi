/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */

(function () {
  'use strict';

  var colors = {
    aqua: '#7fdbff',
    blue: '#0074d9',
    lime: '#01ff70',
    navy: '#001f3f',
    teal: '#39cccc',
    olive: '#3d9970',
    green: '#2ecc40',
    red: '#ff4136',
    maroon: '#85144b',
    orange: '#ff851b',
    purple: '#b10dc9',
    yellow: '#ffdc00',
    fuchsia: '#f012be',
    gray: '#aaaaaa',
    white: '#ffffff',
    black: '#111111',
    silver: '#dddddd'
  };

  function svg_translate(x, y) {
    return "translate(" + x + "," + y + ")";
  }

  function deep_clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function int_compare(i1, i2) {
    return i1 - i2;
  }

  var big_colors = ["#015eff", "#0cc402", "#fc0a18", "#aea7a5", "#ff15ae", "#d99f07", "#11a5fe", "#037e43", "#ba4455",
    "#d10aff", "#9354a6", "#7b6d2b", "#08bbbb", "#95b42d", "#b54e04", "#ee74ff", "#2d7593", "#e19772", "#fa7fbe",
    "#fe035b", "#aea0db", "#905e76", "#92b27a", "#03c262", "#878aff", "#4a7662", "#ff6757", "#fe8504", "#9340e1",
    "#2a8602", "#07b6e5", "#d21170", "#526ab3", "#ff08e2", "#bb2ea7", "#e4919f", "#09bf91", "#90624c", "#bba94a",
    "#a26c05", "#5c7605", "#df89e7", "#b0487c", "#ee9345", "#70b458", "#b19b71", "#6b6d74", "#ec5206", "#85a7c7",
    "#ff678c", "#b55b3e", "#8054cc", "#7eb0a0", "#c480b3", "#d9102d", "#5a783f", "#fe66d2", "#bc13c8", "#62bd33",
    "#b8ab03", "#8f31ff", "#fd8581", "#049279", "#74739c", "#0e6ad6", "#747151", "#01878d", "#0380bf", "#bf81fd",
    "#8ba1fb", "#887a02", "#c09bb5", "#a97741", "#d04096", "#c19083", "#a583da", "#8ca149", "#b16368", "#c23e37",
    "#fd7b40", "#d12153", "#b24cd2", "#56a66f", "#5dafbd", "#78aceb", "#2375fe", "#d49f54", "#ea41d3", "#885e92",
    "#8468fd", "#cf4eff", "#c93716", "#c563af", "#d66886", "#664dfd", "#468530", "#6d60be", "#fa8a64", "#059843",
    "#ff55a1", "#638b8e", "#bd6d2e", "#ff0f7a", "#3f93ff", "#ff5167", "#8f9a7f", "#d68201", "#8b9054", "#fe4935",
    "#9d7e85", "#01a52b", "#59b99b", "#ba5cc4", "#4bbe73", "#679925", "#b99023", "#408158", "#fa56fe", "#d6603b",
    "#839004", "#d1786a", "#cb4170", "#897abb", "#8e8ca1", "#4197c2", "#a88e49", "#157fd5", "#ba6bff", "#d20498",
    "#da6d10", "#7fb905", "#bd728d", "#fc0cfe", "#f51590", "#e35c60", "#7e685e", "#5c65dc", "#6886c3", "#8faeb5",
    "#11b3f9", "#ca95db", "#ab1de7", "#6c9a54", "#ea8bb4", "#a17da5", "#687ddc", "#ff0f37", "#6e9b77", "#d71c02",
    "#93784e", "#9d8b7b", "#fc08c6", "#e974e4", "#44a298", "#9f528d", "#9f69cf", "#f27cd2", "#0ec339", "#6f7a2d",
    "#aa72b7", "#0393ad", "#43709f", "#ac4e69", "#707d71", "#db5d95", "#55bb4f", "#aeac62", "#a8af3e", "#de9b38",
    "#b77b5d", "#fc4277", "#fe8299", "#b0409b", "#876910", "#d50fe5", "#f547ae", "#a9a4c9", "#976565", "#049f67",
    "#e58acd", "#cea06d", "#60778f", "#7a677e", "#d62f44", "#a3584a", "#d3686f", "#fe4103", "#539d01", "#0f7b6e",
    "#667e5a", "#ff444e", "#938f37", "#8f74f4", "#a5981a", "#c18a96", "#9c5d38", "#ac02ff", "#b86804", "#da581a",
    "#d150cf", "#da6a58", "#bf94fe", "#0fb9d3", "#4b5de9", "#5b90a8", "#c86a9a", "#7a5faa", "#d44de5", "#d658bd",
    "#d27951", "#2dad06", "#8cb64a", "#c40db3", "#9a601e", "#fb731d", "#e2948b", "#479d53", "#a8ac7e", "#df773a",
    "#447b02", "#a2577e", "#4b83fd", "#f23dbe"];
  var big_colors_scale = d3.scale.ordinal().range(big_colors);

  var nominee_clones = [];
  var nominee_names = ["shrimp", "sea eel", "tuna", "squid", "sea urchin", "salmon roe", "egg", "fatty tuna", "tuna roll", "cucumber roll"];
  var plurality_color = colors.aqua;
  var irv_color = colors.olive;
  var rankedpairs_color = colors.green;

  var color_scale = d3.scale.category10();
  var height = 50;
  var width = 50;


  // State
  var current_nominees = [0,1,2,3,4,5,6,8];
  var raw_data;
  var data_preferences;

  var horizontal_bins = d3.scale.ordinal()
    .domain(d3.range(0, current_nominees.length))
    .rangeBands([0, width]);

  // Some basic legend / info
  d3.select("body").append('div').style("width", "20em").style("height", "1em")
    .style("background-color", plurality_color).text("Plurality Voting");

  d3.select("body").append('div').style("width", "20em").style("height", "1em")
    .style("background-color", irv_color).text("IRV Voting");

  d3.select("body").append('div').style("width", "20em").style("height", "1em")
    .style("background-color", rankedpairs_color).text("Ranked Pairs Voting");

  // Append candidates div
  d3.selectAll("body").append("div")
    .attr("class", "candidates");

  d3.selectAll("body").append("div")
    .style("height", "3em")
    .text("Update")
    .on("click", () => {
      var clone = "tuna";
      var new_num = Enumerable.From(nominee_names).Where(name => name.includes(clone)).Count();
      var new_candidate = clone + new_num;
      nominee_names.push(new_candidate);
      nominee_clones.push({
        cloned: clone,
        clonee: new_candidate,
      });

      update_all();
    });

  // setup the nominees
  function update_candidates() {
    var select_color = colors.silver;

    var candidates_div = d3.select(".candidates");
    var single_nominee = candidates_div.selectAll("div").data(nominee_names, d => d);

    var nominee_enter = single_nominee.enter()
      .append("div")
      .style("display", function(d) {
          return "inline-block";
      })
      .style("margin", "5px")
      .style("background-color", function (d, i) {
        if (current_nominees.includes(i)) {

          return select_color;
        } else {
          return "white";
        }
      });

    nominee_enter
      .append("div")
      .style("width", "60px")
      .style("height", "10px")
      .style("background-color", function (d, i) {
        return color_scale(i);
      });

    nominee_enter
      .append("div")
      .text(function(d) { return d; });

    nominee_enter
      .on('click', function(d, i) {
        // change state
        if (current_nominees.includes(i)) {
          current_nominees.splice(current_nominees.indexOf(i), 1);
        } else {
          current_nominees.push(i);
        }

        // update rendering
        if (current_nominees.includes(i)) {
          $(this).css("background-color", select_color);
        } else {
          $(this).css("background-color", "");
        }

        console.log(current_nominees);
        updateNominees();
      });
  }

  // Set up the sushi dataset!


  // Add the voters to the svg
  var voters = d3.selectAll("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("line-height", ".2").remove();

  // Voting systems!!

  // takes preferential votes
  // returns winner
  function instant_runoff_voting(candidates, voter_preferences) {
    var vote_totals = new Array(nominee_names.length).fill(0);

    voter_preferences.forEach(function(voter) {
      var vote = voter.find(function(d) {
        return candidates.includes(d);
      });

      vote_totals[vote]+=1;
    });

    // if majority, they win, otherwise remove weakest candidate
    for (var i = 0; i < vote_totals.length; i++) {
      if (vote_totals[i] >= voter_preferences.length / 2) {
        return i;
      }
    }

    var weakest = vote_totals.indexOf(Math.min.apply(Math, vote_totals.filter(function(d) { return d != 0; })));
    var newCandidates = candidates.slice();
    newCandidates.splice(newCandidates.indexOf(weakest), 1);
    return instant_runoff_voting(newCandidates, voter_preferences);
  }

  // also returns margin winner won by
  function plurality_voting_pair(pair, voter_preferences) {
    if (pair.length !== 2) throw ("pair must be length 2");

    var votes = voter_preferences.map(function (voter) {
      return plurality_vote(voter, pair);
    });

    var counts = Enumerable.From(votes)
        .GroupBy(function(d) { return d; })
        .OrderBy(function(d) { return -d.Count(); })
        .Select(function (d) {
          return d.ToArray();
        })
        .ToArray();

    // hack: if only one candidate actually gets votes, add the other
    var sorted_candidates = [];
    counts.forEach((d, i) => {
      sorted_candidates.push({
        candidate: d[0],
        count: d.length,
      });
    });

    if (sorted_candidates.length < 2) {
      sorted_candidates.push({
        candidate: pair[0] === sorted_candidates[0].candidate ? pair[1] : pair[0],
        count: 0,
      });
    }

    return {winner: sorted_candidates[0].candidate, loser: sorted_candidates[1].candidate,
      margin: sorted_candidates[0].count - sorted_candidates[1].count};
  }

  function plurality_voting(candidates, voter_preferences) {
    var votes = voter_preferences.map(function (voter) {
      return plurality_vote(voter, candidates);
    });

    var winner = Enumerable.From(votes)
        .GroupBy(function(d) { return d; })
        .MaxBy(function(d) { return d.Count(); })
        .ElementAt(0);

    return winner;
  }

  function rankedpairs_voting(candidates, voter_preferences) {

    var candidate_pairs = Enumerable.From(candidates)
        .SelectMany(function(e) {
          return candidates.map(function (d) { return [e, d]; });
        })
        .Where(function(pair) { return pair[0] !== pair[1]; })
        .ToArray();

    var winners = candidate_pairs.map(function (pair) {
        return plurality_voting_pair(pair, voter_preferences);
    });

    var sorted_winners = Enumerable.From(winners)
        .OrderByDescending(function (match) {
          return match.margin;
        })
        .ToArray();

    var nodes = candidates.map(function(candidate) {
      return {
        _id: candidate,
        links: [],
      };
    });

    // In order of largest winner margin, add an edge for that pair, but only if it doesn't create a cycle.
    sorted_winners.forEach(function (match) {
      var new_graph = JSON.parse(JSON.stringify(nodes));
      new_graph.forEach(function (node) {
        if (node._id === match.loser) {
          node.links.push(match.winner);
        }
      });

      var tpSort = toposort(JSON.parse(JSON.stringify(new_graph)));
      if (tpSort === null) {
        console.log("Cycle");
      } else {
        nodes = new_graph;
      }
    });

    var final_ordering = toposort(JSON.parse(JSON.stringify(nodes))).reverse();
    return final_ordering[0]._id;
  }

  // single vote most preferential
  function plurality_vote(d, candidates) {
    for (var i = 0; i < d.length; i++) {
      if (candidates.includes(d[i])) {
        return d[i];
      }
    }
  }

  ///
  ///  Visualization: bins
  ///

  function updateVoters_stripes() {
    var stripe_size = 2;
    var preference_size = 30;

    var input_data = {
      voters: data_preferences.map(function (d, i) {
            return {
                id: i,
                preferences: d
            };
        }
      ),
      candidates: current_nominees.slice()
    };

    input_data.voters = input_data.voters.sort(function(i1, i2) {
      for (var i = 0; i < i1.preferences.length; i++) {
        if (i1.preferences[i] != i2.preferences[i]) {
          return int_compare(i1.preferences[i], i2.preferences[i]);
        }
      }
    });

    input_data.voters.forEach(function(d) {
      //console.log(d.preferences[0]);
    });

    var ui_voter_rows = voters.selectAll("g")
      .data(input_data.voters);

    ui_voter_rows
      .attr("transform", function(d, i) {
        return svg_translate(0, i * stripe_size);
      })
      .enter()
      .append("g");

    var ui_preference_boxes = ui_voter_rows.selectAll("rect")
      .data(function(d) {
        return d.preferences;
      })
      .attr("height", stripe_size)
      .attr("width", preference_size)
      .attr("x", function(d, i) {
        return preference_size * i;
      })
      .attr("fill", function(d, i) {
        return input_data.candidates.includes(d) ? color_scale(d) : "black";
      })

      .enter()
        .append("rect");




    console.log(input_data);

  }

  function updateVoters_bins() {
    var box_size  = 15;
    var top_margin = 50;

    // Update votes
    var data_votes = data_preferences.map(function (d) {
      return plurality_vote(d, current_nominees);
    });

    // Determine position in bins:
    var data_bins = new Array(current_nominees.length)
      .fill(null)
      .map(function(_, i){
        return { "candidate": current_nominees[i], "voters": [] };
      });

    // takes in a current nominee and returns the bin number
    function votebin(candidate) {
      return data_bins.indexOf(data_bins.find(function(bin) { return bin.candidate === candidate; }));
    }

    data_votes.forEach(function(elem, i) {
      data_bins[votebin(elem)].voters.push(i);
    });

    data_bins.sort(function(b1, b2) { return b1.voters.length - b2.voters.length; } );



    var placeInBin = function(bin, voter) {
      return data_bins[bin].voters.indexOf(voter);
    };

    horizontal_bins.domain(d3.range(0,current_nominees.length));
    var num_columns = Math.floor(horizontal_bins.rangeBand() / box_size);

    var all_voters = voters.selectAll("rect")
      .data(data_votes);

    all_voters
      .enter().append("rect")
      .attr("width", box_size)
      .attr("height", box_size);

    all_voters
      .transition()
      .duration(1000)
      //.delay(function () { return Math.random() * 600; })
      .attr("x", function(d, i) {
        var val = (placeInBin(votebin(d), i) % num_columns) * box_size + horizontal_bins(votebin(d));
        return val;
      })
      .attr("y", function(d, i) {
        return top_margin + Math.floor(placeInBin(votebin(d), i) / num_columns) * box_size;
      });

    all_voters
      .transition()
      .delay(2000)
      .duration(1500)
      .attr("fill", function (d, i) {
        return color_scale(d);
      });

    // Setup titles for buckets:
    var bin_labels = voters.selectAll("text")
      .data(current_nominees, function(d) { return nominee_names[d]});

    bin_labels.enter().append("text").text(function(d) { return nominee_names[d]; });
    bin_labels.exit().remove();

    bin_labels
      .transition()
      .duration(1000)
      .attr("x", function(d) { return horizontal_bins(votebin(d)) + 5;/* + horizontal_bins.rangeBand() / 5;*/ })
      .attr("y", 45);


    console.log(nominee_names[instant_runoff_voting(current_nominees, data_preferences)]);
  }

  // Generates a distribution graph of the candidate's votes
  // Returns an SVG Node
  function generateGraph(preferences, candidate) {
    // Data
    var data = Enumerable.From(preferences)
        .Select(d => d.filter(x => current_nominees.includes(x)))
        .Select(d => d.indexOf(candidate))
        .GroupBy(d => d)
        .Select(d => { return {name: d.ElementAt(0), value: d.Count()}; })
        .OrderBy(d => d.name)
        .ToArray();

    // Constants
    var svg_width = 300;
    var svg_height = 150;
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = svg_width - margin.left - margin.right,
        height = svg_height - margin.top - margin.bottom;

    var linear_colors = d3.scale.linear()
        .domain([0, current_nominees.length - 1])
        .range([colors.blue, colors.silver])
        .interpolate(d3.interpolateHcl);

    // Setup
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);

    // Nodes
    var graph_svg = d3.select("body").append("svg")
        .attr("width", svg_width)
        .attr("height", svg_height);


    var graph = graph_svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, 1500]);//d3.max(data, function(d) { return d.value; })]);

    graph.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    graph.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    graph.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.name))
        .attr("width", x.rangeBand())
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value))
        .attr("fill", (_, i) => linear_colors(i));

    //graph.remove();

    return graph_svg.node();
  }


  function updateNominees() {
    d3.selectAll("body .graphs").remove();
    var graphs = d3.selectAll('body')
        .append('div').attr("class", "graphs");

    var plurality_winner = plurality_voting(current_nominees, data_preferences);
    var irv_winner = instant_runoff_voting(current_nominees, data_preferences);
    var rankedpairs_winner = rankedpairs_voting(current_nominees, data_preferences);

    for (var i in current_nominees) {
      var i = current_nominees[i];
      var g = graphs.append('div');
      g.style("display", "inline-block");
      g.style("text-align", "center");
      g.text("Candidate "+nominee_names[i]);
      g.style("background-color", "white");
      g.style("margin", "1em");
      g.style("outline", i === irv_winner ? "black 5px solid" : "");
      g.style("outline-color", i === irv_winner ? irv_color : "");
      g.style("border", i === rankedpairs_winner ? "black 5px solid" : "");
      g.style("border-color", i === rankedpairs_winner ? rankedpairs_color : "");
      g.transition()
          .duration(1)
          .style("background-color", i === plurality_winner ? plurality_color : colors.white );
      g.append("br");
      g.node().appendChild(generateGraph(data_preferences, i));
    }
  }

  function update_all() {
    // Add in some fake data for clones
    data_preferences = JSON.parse(JSON.stringify(raw_data));
    nominee_clones.forEach(clone => {

    });

    // group by cloned candidate
    // for each preference array
      // remove cloned
      // insert random perm of clones and cloned

    var clone_groups = Enumerable.From(nominee_clones)
      .GroupBy(clone => clone.cloned)
      .Select(group => group.ToArray())
      .ToArray();

    clone_groups.forEach(group => {
      data_preferences.forEach(preference_array => {
          // Randomly shuffle the clones with the original
          var clone_permutation = deep_clone(group).map(c => c.clonee);
          clone_permutation.push(group[0].cloned);
          clone_permutation = clone_permutation.map(c => nominee_names.indexOf(c));
          clone_permutation = d3.shuffle(clone_permutation);

          var cloned_candidate = nominee_names.indexOf(group[0].cloned);
          var cloned_preference = preference_array.indexOf(cloned_candidate);

          // Sneaky way to remove an item in the array and fill in a number of items where it was.
          preference_array.splice.apply(preference_array, [cloned_preference, 1].concat(clone_permutation));
      });
    });

    update_candidates();
    updateNominees();
  }

  d3.dsv(" ", "text/plain")("sushi3a.5000.10.order", function (error, datum) {
    raw_data = datum.map(function (d) {
      return [Number(d["1"]), Number(d["2"]), Number(d["3"]), Number(d["4"]), Number(d["5"]),
        Number(d["6"]),Number(d["7"]),Number(d["8"]),Number(d["9"]),Number(d["10"])];
    }).slice(0, 5000);
      /*.sort(function (i1, i2) {
      return (i1[0] < i2[0] ? -1 : (
        i1[0] > i2[0] ? 1 : 0));
    });*/

    update_all();

  });
})();

/*
     There are two correlations:
        1 Salmon Roe, Sea Urchin (I like weird stuff!)
        2 Tuna, Tuna Roll (I like tuna and can't decide!)

     1 is actually a stronger split vote, and once you remove salmon roe, sea urchin wins plurality! (just by a hair)

     For clones

 */
