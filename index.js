const Logger = require('./logger');
const querystring = require('querystring');
const { getAuthCookie, writeToCache, request, formatCookie } = require('./utils');
const config = require('./constants');
const { username, password } = require('./sensitive');
const { host, loginPath } = config;
const logger = new Logger(__filename);

(async function () {
  try {
    const cookie = getAuthCookie();
    logger.info(cookie);
    // const { Cookie, viewState } = await getParams();
    // const authCookie = await login(Cookie, viewState);
    // writeToCache({ Cookie: formatCookie(authCookie) });
  } catch (error) {
    logger.error(error);
  }
})();

async function login(Cookie, viewState) {
  const form = {
    [config.formUsername]: username,
    [config.formPassword]: password,
    [config.formLogin]: config.login,
    __VIEWSTATE: viewState,
  };
  const formData = querystring.stringify(form);
  const requestOptions = {
    host,
    path: loginPath,
    headers: {
      Cookie,
      'Content-Length': Buffer.byteLength(formData),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  };
  const { headers } = await request(requestOptions, { returnHeaders: true, write: formData });
  return headers['set-cookie'];
}

async function getParams() {
  const requestOptions = {
    host,
    path: loginPath,
    method: 'GET',
  };
  const { results, headers } = await request(requestOptions, { returnHeaders: true });
  const viewState = getViewState(results);
  return { Cookie: headers['set-cookie'], viewState };
}

function getViewState(body) {
  const target = 'id="__VIEWSTATE" value="';
  const targetIdx = body.indexOf(target);
  let results = '';
  let startIdx = target.length + targetIdx;
  let char;
  while (char = body[startIdx++]) {
    if (char === '"') {
      return results;
    }
    results += char;
  }
}