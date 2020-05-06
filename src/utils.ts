const fs = require('fs');
const path = require('path');
const Logger = require('./logger');
const https = require('https');
const { year, month, day } = require('../constants');
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
      reject(err);
    });
    if (options.write) {
      req.write(options.write);
    }
    req.end();
  });
}

function rawCookieToObject(rawCookie) {
  return rawCookie.reduce((results, lineString) => {
    return lineString.split('; ').reduce((results, cookieString) => {
      const splitString = cookieString.split('=');
      results[splitString[0]] = splitString[1] || '';
      return results;
    }, results);
  }, {});
}

function cookieObjectToString(cookieObject) {
  
}

function writeToCache(data, fileName) {
  const cachePath = path.resolve(__dirname, `./${fileName}`);
  let stringData = data;
  if (typeof stringData !== 'string') {
    stringData = JSON.stringify(data);
  }
  fs.writeFileSync(cachePath, stringData);
  logger.info('Wrote to cache');
}

module.exports = {
  formattedDate,
  request,
  writeToCache,
  rawCookieToObject,
};