const { OWNER } = process.env;
import { proceedPath, host } from '../constants';
import { request } from './utils';
import * as sensitive from '../sensitive';

const { [OWNER]: { partners, targetTeeTime } } = sensitive;

function getBookingId(teeObject: any): string {
  const { teeSheet } = teeObject.data;
  for (let idx = 0; idx < teeSheet.length; idx++) {
    const { teeTime, teeSheetTimeId, players } = teeSheet[idx];
    if (teeTime === targetTeeTime) {
      const available = players.filter(({ playerType, playerLabel }) => playerType === 1 && playerLabel.toLowerCase() === 'available');
      if (available.length >= partners.length + 1) return teeSheetTimeId;
      throw new Error('Target time is not available.');
    }
  }
  throw new Error('Target time not found');
}

export async function proceedwithBooking(teeSheet: object, Cookie: string): Promise<any> {
  const bookingId = getBookingId(teeSheet);
  const reqOptions = {
    host,
    path: proceedPath(bookingId),
    headers: {
      Cookie,
    },
    method: 'GET',
  };
  const { results } = await request(reqOptions);
  return JSON.parse(results);
}