import * as fs from 'fs';
import * as path from 'path';

import Logger from './logger';
import { request, writeToCache } from './utils';
import { year, month, day, isLocal } from '../config';
import { courseId, getTimesPath, host, noTimesErrorMessage } from '../constants';
import * as sensitive from '../sensitive';

const { OWNER } = process.env;
const { [OWNER]: { partners, targetTeeTime } } = sensitive;
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

function findBooking(teeObject: { data: { teeSheet: any[] } }): string {
  const { teeSheet } = teeObject.data;
  let returnNextAvailable = false;
  let nextBestTeeId = '';
  for (const teeTimeData of teeSheet) {
    const { teeTime, teeSheetTimeId, players } = teeTimeData;
    const isAvailable = players
      .filter(({ playerType, playerLabel }) => playerType === 1 && playerLabel.toLowerCase() === 'available')
      .length >= partners.length + 1;
    if (teeTime === targetTeeTime) {
      if (isAvailable) return teeSheetTimeId;
      if (nextBestTeeId) return nextBestTeeId;
      logger.warn('Target time is not available');
      returnNextAvailable = true;
    } else if (isAvailable) {
      if (returnNextAvailable) return teeSheetTimeId;
      nextBestTeeId = teeSheetTimeId;
    }
  }
  throw new Error(noTimesErrorMessage);
}

export async function getBookingId(Cookie: string): Promise<string> {
  let teeSheet;
  if (isLocal) {
    logger.info('Reading from cache');
    teeSheet = readTeeCache();
  }
  if (!teeSheet) {
    logger.info('Retrieving new tee sheet');
    teeSheet = await getNewTeeSheet(Cookie);
  }
  return findBooking(teeSheet);
}