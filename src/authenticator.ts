import * as fs from 'fs';
import * as path from 'path';
import * as querystring from 'querystring';

import { convertCookieToString, request, rawCookieToObject, writeToCache } from './utils';
import * as constants from '../constants';
import { username, password } from '../sensitive';
import { tParams, tGenericObject } from './typings'
import Logger from './logger';

const cachePath = path.resolve(__dirname, './cookie-cache.json');
const generalOptions = {
  host: constants.host,
  path: constants.loginPath,
};
const logger = new Logger(__filename);


function getViewState(body: string): string {
  const target = 'id="__VIEWSTATE" value="';
  const targetIdx = body.indexOf(target);
  if (targetIdx === -1) {
    throw new Error('VALUE NOT FOUND');
  }
  let results = '';
  let startIdx = target.length + targetIdx;
  let char = '_';
  while (char) {
    char = body[startIdx++];
    if (char === '"') {
      return results;
    }
    results += char;
  }
}

async function getParams(): Promise<tParams> {
  const requestOptions = {
    ...generalOptions,
    path: constants.loginPath,
    method: 'GET',
  };
  const { results, headers } = await request(requestOptions, { returnHeaders: true });
  const viewState = getViewState(results);
  return { Cookie: headers['set-cookie'], viewState };
}

async function login(Cookie: string[], viewState: string): Promise<string[]> {
  const form = {
    [constants.formUsername]: username,
    [constants.formPassword]: password,
    [constants.formLogin]: constants.login,
    __VIEWSTATE: viewState,
  };
  const formData = querystring.stringify(form);
  const requestOptions = {
    ...generalOptions,
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

async function getNewCookies(): Promise<tGenericObject> {
  const { Cookie, viewState } = await getParams();
  const authCookie = await login(Cookie, viewState);
  const combinedCooks = Cookie.concat(authCookie);
  const newCooks = rawCookieToObject(combinedCooks);
  writeToCache({ Cookie: newCooks }, 'cookie-cache.json');
  return newCooks;
}

function getCookieFromCache(): tGenericObject | null {
  let rawCache: string;
  try {
    rawCache = fs.readFileSync(cachePath, { encoding: 'utf8' });
  } catch (error) {
    logger.warn('Cache does not exist');
  }
  if (!rawCache) {
    return null;
  }
  const { Cookie } = typeof rawCache === 'string' ? JSON.parse(rawCache) : rawCache;
  const expireDate = new Date(Cookie.expires);
  const currentTime = new Date();
  return currentTime < expireDate ? Cookie : null;
}

export async function getCookies(): Promise<string> {
  let cookie = getCookieFromCache();
  if (!cookie) {
    logger.info('Cannot use cached cook cooks');
    cookie = await getNewCookies();
  } else {
    logger.info('Using cached cook cooks');
  }
  return convertCookieToString(cookie);
}