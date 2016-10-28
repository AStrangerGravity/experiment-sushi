requirejs(["charts/basic_vote", "charts/candidate_breakdown", "charts/irv_vote", "candidate_info"],
  (basic_vote, candidate_breakdown, irv_vote, candidate_info) => {
    // embed the charts
    var three_candidates =["tuna", "sea urchin", "salmon roe"];
    irv_vote("#irv_three", candidate_info.get_by_name(three_candidates), candidate_info.basic.names);
  });
