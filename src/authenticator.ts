import * as querystring from 'querystring';

import { convertCookieToString, request, rawCookieToObject } from './utils';
import * as constants from '../constants';
import * as sensitive from '../sensitive';
import { tParams, tGenericObject } from './typings'

const { OWNER } = process.env;
const { [OWNER]: { username, password } } = sensitive;
const generalOptions = {
  host: constants.host,
  path: constants.loginPath,
};

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
  return rawCookieToObject(combinedCooks);
}

export async function getCookies(): Promise<string> {
  const cookie = await getNewCookies();
  return convertCookieToString(cookie);
}