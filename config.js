const { OWNER } = process.env;
const { [OWNER]: { targetTeeTime, golfDay } } = require('./sensitive');
const bookingDay = 17;
const month = 5;
const year = 2020;
const isLocal = false;
const retryTimeout = 5000;

const hour = 19; // 3 pm utc
const minute = 55;

const format = (number) => (number < 10 ? '0' : '') + number;

module.exports = {
  year: format(year),
  month: format(month),
  day: format(golfDay),
  targetTeeTime,
  isLocal,
  tryToBookAt: {
    year,
    month: month - 1, // Jan is 0. Dec is 11
    day: bookingDay,
    hour,
    minute,
  },
  retryTimeout,
};