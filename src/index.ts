import Logger from './logger'
import { getCookies } from './authenticate';

const logger = new Logger(__filename);

(async function (): Promise<void> {
  try {
    logger.info('Getting cook cooks');
    const cookies = await getCookies();
    logger.info('cookies:', cookies);
  } catch (error) {
    logger.error(error);
  }
})();