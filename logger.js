class Logger {
  constructor(filename) {
    this.filename = filename;
    this.helper = helper.bind(null, filename);
  }
  info(...args) {
    this.helper('info', ...args);
  }
  error(...args) {
    this.helper('error', ...args);
  }
  warn(...args) {
    this.helper('warn', ...args);
  }
}

function helper(filename, level, ...args) {
  console[level](new Date().toISOString(), '|', filename, '|', ...args);
}

module.exports = Logger;