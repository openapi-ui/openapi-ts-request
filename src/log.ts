import chalk from 'chalk';

const log = (...rest) =>
  console.log(`  ${chalk.blue('[openAPI]')}: ${rest.join('\n')}`);

export const logError = (...rest) =>
  console.error(`  ${chalk.red('❌ [openAPI]')}: ${rest.join('\n')}`);

export default log;
