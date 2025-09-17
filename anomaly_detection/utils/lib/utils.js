exports.getUTCNow = function () {
  return Math.round(new Date().valueOf() / 1000);
};

exports.sleep = function (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
