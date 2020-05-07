const targetTeeTime = '13:30:00'
const bookingDay = 8;
const month = 5;
const year = 2020;
const isLocal = false;


const hour = 15; // 3 pm
const minute = 59;
const golfDay = bookingDay + 14;

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
  }
};