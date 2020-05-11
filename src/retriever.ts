import * as fs from 'fs';
import * as path from 'path';

import Logger from './logger';
import { request, writeToCache } from './utils';
import { year, month, day, isLocal } from '../config';
import { courseId, getTimesPath, host } from '../constants';

const { OWNER } = process.env;
const fileName = `${OWNER}-tee-times.json`;
const teeCachePath = path.resolve(__dirname, `../cache/${fileName}`);
const date = year + month + day;
const logger = new Logger(__filename);

function readTeeCache(): object {
  try {
    const cache = fs.readFileSync(teeCachePath, { encoding: 'utf8' });
    return typeof cache === 'string' ? JSON.parse(cache) : cache;
  } catch (error) {
    logger.warn('Cannot read tee cache');
  }
}

async function getNewTeeSheet(Cookie: string): Promise<object> {
  const reqOptions = {
    host,
    path: getTimesPath(date, courseId),
    headers: {
      Cookie,
    },
    method: 'GET',
  };
  const { results } = await request(reqOptions);
  writeToCache(results, fileName);
  return JSON.parse(results);
}

export async function getTeeSheet(Cookie: string): Promise<object> {
  let teeSheet;
  if (isLocal) {
    logger.info('Reading from cache');
    teeSheet = readTeeCache();
  }
  if (!teeSheet) {
    logger.info('Retrieving new tee sheet');
    teeSheet = await getNewTeeSheet(Cookie);
  }
  return teeSheet;
}