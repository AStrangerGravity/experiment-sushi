requirejs(["charts/basic_vote", "charts/candidate_breakdown", "charts/irv_vote", "showdown", "candidate_info", "charts/voter_preference"],
  function (basic_vote, candidate_breakdown, irv_vote, showdown, candidate_info, voter_preference) {
    // convert markdown to html
    var converter = new showdown.Converter();
    var markdown_text = document.getElementById("markdowntext");
    markdown_text.innerHTML = converter.makeHtml(markdown_text.innerHTML);
  
    // embed the charts
    voter_preference('#voter_preference');
    basic_vote('#basic_vote', candidate_info.basic.ids, candidate_info.basic.names, false);
    basic_vote('#basic_vote_cloning', candidate_info.basic.ids, candidate_info.basic.names, true);
    candidate_breakdown(candidate_info.basic.ids, candidate_info.basic.names);
    // Three candidate IRV
    var three_candidates = ["tuna", "sea urchin", "salmon roe"];
    irv_vote("#irv_three", candidate_info.get_by_name(three_candidates), candidate_info.basic.names);
    // Full candidate list IRV
    irv_vote("#irv_full", candidate_info.basic.ids, candidate_info.basic.names, false);
    irv_vote("#irv_full_cloning", candidate_info.basic.ids, candidate_info.basic.names, true);
});
