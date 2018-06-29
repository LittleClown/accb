import { ColorfulChalkLogger, INFO } from 'colorful-chalk-logger'


/**
 * project-level logger.
 * @type {ColorfulChalkLogger}
 */
export const logger = new ColorfulChalkLogger(
  'accb',
  { level: INFO },
)
