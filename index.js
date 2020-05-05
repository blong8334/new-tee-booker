const Logger = require('./logger');
const querystring = require('querystring');
const { formattedDate, request } = require('./utils');
const config = require('./constants');
const { username, password } = require('./sensitive');
const { host } = config;
const logger = new Logger(__filename);

(async function () {
  try {
    const { Cookie, viewState } = await getCookies();
    const authCookie = await login(Cookie, viewState);

  } catch (error) {
    logger.error(error);
  }
})();

async function login(cookies, viewState) {
  const form = {
    [config.formUsername]: username,
    [config.formPassword]: password,
    [config.formLogin]: config.login,
    __VIEWSTATE: viewState,
  };
  const formData = querystring.stringify(form);
  const requestOptions = {
    host,
    path: '/login.aspx',
    headers: {
      Cookie: cookies,
      'Upgrade-Insecure-Requests': 1,
      'Content-Length': Buffer.byteLength(formData),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  };
  const { headers } = await request(requestOptions, { returnHeaders: true, write: formData });
  return headers['set-cookie'];
}

async function getCookies() {
  const requestOptions = {
    host,
    path: '/login.aspx',
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
  while (true) {
    const char = body[startIdx++];
    if (char === '"') {
      return results;
    }
    results += char;
  }
}