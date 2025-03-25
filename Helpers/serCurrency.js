const countryCurrencyMap = {
  Ethiopia: "ETB",
  USA: "USD",
  Canada: "CAD",
  Mexico: "MXN",
  China: "CNY",
  Japan: "JPY",
};

const setCurrency = function (next) {
  this.currency = countryCurrencyMap[this.country]; // Automatically set currency
  next();
};

export default setCurrency;
