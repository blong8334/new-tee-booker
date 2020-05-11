const { OWNER } = process.env;
import { proceedPath, host } from '../constants';
import { request } from './utils';

export async function proceedwithBooking(bookingId: string, Cookie: string): Promise<any> {
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