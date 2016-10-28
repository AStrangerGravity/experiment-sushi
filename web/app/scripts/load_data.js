/**
 * Created by LocalUser on 6/4/2016.
 */

// global on purpose
global_data = new Promise((resolve, reject) => {
  d3.dsv(" ", "text/plain")("sushi3a.5000.10.order", (error, datum) => {
    raw_data = datum.map(d => {
      return [Number(d["1"]), Number(d["2"]), Number(d["3"]), Number(d["4"]), Number(d["5"]),
        Number(d["6"]),Number(d["7"]),Number(d["8"]),Number(d["9"]),Number(d["10"])];
    }).slice(0, 5000); // taking just 5000 points for now
  });
});
