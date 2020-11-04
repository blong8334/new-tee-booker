import Logger from './logger'
import { getCookies } from './authenticator';
import { getBookingId } from './retriever';
import { proceedwithBooking } from './proceeder';
import { bookTime } from './booker';
import { noTimesErrorMessage, retryMessages } from '../constants';

const retryTimeout = 5000;
const logger = new Logger(__filename);
const maxTries = 10;

let proceedRetries = 0;
async function proceed(bookingId: string, cookies: string): Promise<void | NodeJS.Timeout> {
  try {
    if (!bookingId) {
      bookingId = await getBookingId(cookies);
    }
    const results = await proceedwithBooking(bookingId, cookies);
    logger.info('proceed results', JSON.stringify(results, null, 2));
    const { message } = results.data;
    if (message) {
      if (retryMessages.some((m: string) => message.includes(m))) {
        logger.info('Time is still locked. Waiting and retrying.');
        return setTimeout(async () => { await proceed(bookingId, cookies); }, retryTimeout);
      }
      if (message.includes('The Tee Time you have selected is currently locked by another user')) {
        logger.info('TEE TIME GOT SNATCHED - GETTING A NEW TIME');
        return proceed('', cookies);
      }
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
  const now = new Date();
  const day = now.getDay();
  const isRightDay = day === 0 || day === 6;
  const isRightHour = now.getHours() === 20;
  const isRightMinutes = now.getMinutes() >= 55;
  if (!(isRightDay && isRightHour && isRightMinutes)) {
    logger.info('IT IS NOT TIME TO BOOK');
    process.exit(0);
  }
  const { cookies, bookingId } = await getCookiesAndId();
  return proceed(bookingId, cookies);
})();