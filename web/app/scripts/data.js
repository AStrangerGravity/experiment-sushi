define(["d3"], (d3) => {
  var data_promise = new Promise((resolve, reject) => {
    d3.dsv(" ", "text/plain")("sushi3a.5000.10.order", function (error, datum) {
      if (error !== null) {
        reject(error);
        throw error;
      }

      var raw_data = datum.map(function (d) {
        return [Number(d["1"]), Number(d["2"]), Number(d["3"]), Number(d["4"]), Number(d["5"]),
          Number(d["6"]), Number(d["7"]), Number(d["8"]), Number(d["9"]), Number(d["10"])];
      });

      var cropped_500 = raw_data.slice(0, 500);
      var cropped_30 = raw_data.slice(0, 30);

      var returned_data = {
        raw: raw_data,
        cropped_500: cropped_500,
        cropped_30: cropped_30
      };

      resolve(returned_data);
    });
  });

  return data_promise;
});
