import Logger from './logger'
import { getCookies } from './authenticator';
import { getTeeSheet } from './retriever';
import { proceedwithBooking } from './proceeder';
import { bookTime } from './booker';

const logger = new Logger(__filename);
const targetDate = new Date(2020, 4, 8, 15, 59);
const msecondsToGo = (): number => targetDate.valueOf() - Date.now();

async function proceed(teeSheet, cookies): Promise<void> {
  try {
    const results = await proceedwithBooking(teeSheet, cookies);
    logger.info('proceed results', JSON.stringify(results, null, 2));
    if (results.data.message && results.data.message.includes('A booking restriction is preventing you from')) {
      return setTimeout(() => proceed(teeSheet, cookies), 8000) as any;
    }
    const bookingResults = await bookTime(results, cookies);
    logger.info('bookingResults', bookingResults);
  } catch (error) {
    logger.error(error);
  }
}

const interval = setInterval(() => logger.info('Waiting for ', new Date(Date.now() + msecondsToGo())), 60000);

(async function (): Promise<void> {
  logger.info('Getting cook cooks');
  const cookies = await getCookies();
  logger.info('Got cookies');
  const teeSheet = await getTeeSheet(cookies);
  logger.info('Got tee sheet');
  setTimeout(() => {
    clearInterval(interval);
    proceed(teeSheet, cookies);
  }, msecondsToGo());
})();