define(["d3"], (d3) => {
  function deep_clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  var master_names = ["shrimp", "sea eel", "tuna", "squid", "sea urchin", "salmon roe", "egg", "fatty tuna", "tuna roll", "cucumber roll"];
  return {
    // todo: remove master and basic. return pairs of (names, candidate_numbers)
    basic: {
      ids: [0, 1, 2, 3, 4, 5, 6, 8],
      names: master_names
    },
    get_by_name: function (names) {
      return names.map(name => master_names.indexOf(name));
    },
    get_data_with_clones: function(original_data, original_ids, original_full_name_list, clone_list) {

      // [(cloned_id, new_id)]
      var clones = clone_list.map((cloned_id, i) => {
        return {
          cloned_id: cloned_id,
          new_id: i + original_full_name_list.length,
          name: original_full_name_list[cloned_id] + "_" + i
        }
      });


      // Create new id list with clones
      var id_list = original_ids.concat(clones.map(c => c.new_id));
      
      // Create new name list with clones
      var name_list = original_full_name_list.concat(clones.map(c => c.name));

      // Create new data with clones

      var data = deep_clone(original_data);
      // [[clone_1, clone_1],[...]]
      var clone_groups = Enumerable.From(clones)
        .GroupBy(clone => clone.cloned_id)
        .Select(group => group.ToArray())
        .ToArray();

      clone_groups.forEach(group => {
        data.forEach(preference_array => {
          // Randomly shuffle the clones with the original
          var clone_permutation = deep_clone(group).map(c => c.new_id);
          clone_permutation.push(group[0].cloned_id);
          clone_permutation = d3.shuffle(clone_permutation);

          var cloned_candidate = group[0].cloned_id;
          var cloned_preference = preference_array.indexOf(cloned_candidate);

          // Sneaky way to remove an item in the array and fill in a number of items where it was.
          preference_array.splice.apply(preference_array, [cloned_preference, 1].concat(clone_permutation));
        });
      });
      
      // Return final dataset
      return {
        data: data,
        ids: id_list,
        names: name_list,
        clones: clones
      }
    }
  }
});
