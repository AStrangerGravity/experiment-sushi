/**
 * Created by LocalUser on 5/21/2016.
 */
/**
 * LICENSE: MIT
 */

/**
 * Try to get a topological sorting out of directed graph.
 *
 * @param nodes {Object} A list of nodes, including edges (see below).
 * @return {Array | Null} An array if the topological sort could succeed, null if there is any cycle somewhere.
 */
function toposort (nodes) {
  // Test if a node got any icoming edge
  function hasIncomingEdge(list, node) {
    for (var i = 0, l = list.length; i < l; ++i) {
      if (list[i].links.includes(node._id)) {
        return true;
      }
    }
    return false;
  };

  // Kahn Algorithm
  var L = [],
    S = nodes.filter(function(node) {
      return !hasIncomingEdge(nodes, node);
    }),
    n = null;

  while(S.length) {
    // Remove a node n from S
    n = S.pop();
    // Add n to tail of L
    L.push(n);

    var i = n.links.length;
    while (i--) {
      // Getting the node associated to the current stored id in links
      var m = Enumerable.From(nodes)
        .Where( function (d) { return d._id === n.links[i]; }).ToArray()[0];

      // Remove edge e from the graph
      n.links.pop();

      if (!hasIncomingEdge(nodes, m)) {
        S.push(m);
      }
    }
  }

  // If any of them still got links, there is cycle somewhere
  var nodeWithEdge = nodes.find(function(node) {
    return node.links.length !== 0;
  });

  return (nodeWithEdge) ? null: L;
}
