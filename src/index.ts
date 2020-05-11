import Logger from './logger'
import { getCookies } from './authenticator';
import { getBookingId } from './retriever';
import { proceedwithBooking } from './proceeder';
import { bookTime } from './booker';
import { tryToBookAt } from '../config';

const { WAIT } = process.env;
const waitToBook = WAIT !== 'false';
const { year, month, day, hour, minute } = tryToBookAt;
const logger = new Logger(__filename);
const targetDate = new Date(year, month, day, hour, minute);
const msecondsToGo = (): number => targetDate.valueOf() - Date.now();

async function proceed(bookingId: string, cookies: string): Promise<void> {
  try {
    const results = await proceedwithBooking(bookingId, cookies);
    logger.info('proceed results', JSON.stringify(results, null, 2));
    if (results.data.message && results.data.message.includes('A booking restriction is preventing you from')) {
      return setTimeout(() => proceed(bookingId, cookies), 8000) as any;
    }
    const bookingResults = await bookTime(results, cookies);
    logger.info('bookingResults', bookingResults);
  } catch (error) {
    logger.error(error);
  }
}

const interval = waitToBook && setInterval(() => logger.info('Waiting for ', new Date(Date.now() + msecondsToGo())), 60000);

(async function (): Promise<any> {
  const cookies = await getCookies();
  logger.info('Got cook cooks');
  const bookingId = await getBookingId(cookies);
  logger.info('Got tee sheet');
  const runner = (): Promise<void> => {
    clearInterval(interval);
    return proceed(bookingId, cookies);
  };
  return waitToBook ? setTimeout(runner, msecondsToGo()) : runner();
})();