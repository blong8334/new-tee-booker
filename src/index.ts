import Logger from './logger'
import { getCookies } from './authenticator';
import { getBookingId } from './retriever';
import { proceedwithBooking } from './proceeder';
import { bookTime } from './booker';
import { tryToBookAt } from '../config';
import { noTimesErrorMessage } from '../constants';

const { WAIT } = process.env;
const waitToBook = WAIT !== 'false';
const { year, month, day, hour, minute } = tryToBookAt;
const logger = new Logger(__filename);
const targetDate = new Date(year, month, day, hour, minute);
const msecondsToGo = (): number => targetDate.valueOf() - Date.now();
const maxTries = 10;

let proceedRetries = 0;
async function proceed(bookingId: string, cookies: string): Promise<void | NodeJS.Timeout> {
  try {
    if (!bookingId) {
      bookingId = await getBookingId(cookies);
    }
    const results = await proceedwithBooking(bookingId, cookies);
    logger.info('proceed results', JSON.stringify(results, null, 2));
    if (results.data.message && results.data.message.includes('A booking restriction is preventing you from')) {
      return setTimeout(async () => { await proceed(bookingId, cookies); }, 250);
    }
    if (results.data.message && results.data.message.includes('The Tee Time you have selected is currently locked by another user')) {
      logger.info('TEE TIME GOT SNATCHED - GETTING A NEW TIME');
      return proceed('', cookies);
    }
    const bookingResults = await bookTime(results, cookies);
    logger.info('bookingResults', bookingResults);
  } catch (error) {
    logger.error(error);
    if (error.message === noTimesErrorMessage) {
      process.exit(0);
    }
    if (proceedRetries++ < maxTries) {
      logger.info('Retrying request');
      return proceed('', cookies);
    }
    throw new Error('Brian is a fool and I cannot book for some reason that his mind cannot grasp');
  }
}

let cookRetries = 0;
async function getCookiesAndId(): Promise<{ cookies: string; bookingId: string }> {
  try {
    const cookies = await getCookies();
    logger.info('Got cook cooks');
    const bookingId = await getBookingId(cookies);
    logger.info('Got booking ID');
    return { cookies, bookingId };
  } catch (error) {
    logger.error(error);
    if (error.message === noTimesErrorMessage) {
      logger.info('Nothing left to do');
      process.exit(0);
    }
    if (cookRetries++ < maxTries) {
      logger.info('Retrying cooking and booking id retrieval');
      return getCookiesAndId();
    }
    throw new Error('Cannot get cookies and/or booking ID');
  }
}


(async function (): Promise<any> {
  const { cookies, bookingId } = await getCookiesAndId();
  const interval = waitToBook && setInterval(() => logger.info('Waiting for ', new Date(Date.now() + msecondsToGo())), 60000);
  const runner = async (): Promise<void> => {
    clearInterval(interval);
    await proceed(bookingId, cookies);
  };
  return waitToBook ? setTimeout(runner, msecondsToGo()) : runner();
})();