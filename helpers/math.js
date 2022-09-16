module.exports = function isEven(n) {
  return n % 2 == 0;
};

module.exports = function isOdd(n) {
  return Math.abs(n % 2) == 1;
};

module.exports = function isDivisibleBy3(n) {
  return n % 3 == 0;
};
