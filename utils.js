const Logger = require('./logger');
const https = require('https');
const { year, month, day } = require('./constants');
const logger = new Logger(__filename);

const formattedDate = year + month + day;

function request(params, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(params, (res) => {
      logger.info('statusCode:', res.statusCode);
      logger.info('headers:', res.headers);
      let results = '';
      res.on('data', (data) => {
        logger.info('RECEIVING DATA');
        results += data;
      });
      res.on('end', (data) => {
        results += data;
        if (options.returnHeaders) {
          results = { results, headers: res.headers };
        }
        resolve(results);
        logger.info('REQUEST FINISHED');
      });
    });
    req.on('error', (err) => {
      reject(err)
    });
    if (options.write) {
      req.write(options.write);
    }
    req.end();
  });
}

module.exports = {
  formattedDate,
  request,
};