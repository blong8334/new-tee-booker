const fs = require('fs');
const path = require('path');
const Logger = require('./logger');
const https = require('https');
const { year, month, day } = require('./constants');
const logger = new Logger(__filename);
const cachePath = path.resolve(__dirname, './cache.json');

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

function formatCookie(rawCookie) {
  return rawCookie.reduce((results, lineString) => {
    return lineString.split('; ').reduce((results, cookieString) => {
      const splitString = cookieString.split('=');
      results[splitString[0]] = splitString[1] || '';
      return results;
    }, results);
  }, {});
}

function writeToCache(data) {
  let stringData = data;
  if (typeof stringData !== 'string') {
    stringData = JSON.stringify(data);
  }
  fs.writeFileSync(cachePath, stringData);
  logger.info('Wrote to cache');
}

async function getAuthCookie() {
  // check cache. check expiration. if cookie is still valid, return it.
  // otherwise get new cookie and write to cache. then return it.
  let cache = fs.readFileSync(cachePath, { encoding: 'utf8' });
  if (typeof cache === 'string') {
    cache = JSON.parse(cache);
  }
  const expireDate = new Date(cache.Cookie.expires);
  const currentTime = new Date();
  if (currentTime.valueOf() < expireDate.valueOf()) {
    return Object.keys(cache.Cookie).reduce((results, key) => {
      results += key;
      const value = cache.Cookie[key];
      if (value) {
        results += `=${value}`;
      }
      return results + '; ';
    }, '').slice(0, -2);
  }
}

module.exports = {
  formattedDate,
  request,
  writeToCache,
  formatCookie,
  getAuthCookie,
};