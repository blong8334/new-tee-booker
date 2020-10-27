import Logger from './logger';
import { request } from './utils';
import { courseId, getTimesPath, host, noTimesErrorMessage } from '../constants';
import * as sensitive from '../sensitive';

const format = (number: number): string => (number < 10 ? '0' : '') + number;
const { OWNER } = process.env;
const { [OWNER]: { partners, targetTeeTime } } = sensitive;
const golfDay = new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 14);
const year = golfDay.getFullYear();
const month = golfDay.getMonth() + 1;
const day = golfDay.getDate();
const date = '' + year + format(month) + format(day);
const logger = new Logger(__filename);

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
  return JSON.parse(results);
}

function findBooking(teeObject: { data: { teeSheet: any[] } }): string {
  const { teeSheet } = teeObject.data;
  let returnNextAvailable = false;
  let nextBestTeeId = '';
  for (const teeTimeData of teeSheet) {
    const { bookingTimeTypeTxt, teeTime, teeSheetTimeId, players } = teeTimeData;
    const isAvailable = bookingTimeTypeTxt === 'Blocked' || players
      .filter(({ playerType, playerLabel }) => playerType === 1 && playerLabel.toLowerCase() === 'available')
      .length >= partners.length + 1;
    if (teeTime === targetTeeTime) {
      if (isAvailable) return teeSheetTimeId;
      if (nextBestTeeId) return nextBestTeeId;
      logger.warn('Target time is not available');
      returnNextAvailable = true;
    } else if (isAvailable) {
      if (teeTime > targetTeeTime || returnNextAvailable) {
        logger.info('BEST TEE TIME:', teeTime);
        return teeSheetTimeId;
      }
      logger.info(`Next best time is at ${teeTime}`);
      nextBestTeeId = teeSheetTimeId;
    }
  }
  throw new Error(noTimesErrorMessage);
}

export async function getBookingId(Cookie: string): Promise<string> {
  const teeSheet = await getNewTeeSheet(Cookie);
  return findBooking(teeSheet as any);
}