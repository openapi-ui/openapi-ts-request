import chalk from 'chalk';

const log = (...rest) =>
  console.log(`${chalk.blue('[openAPI]')}: ${rest.join('\n')}`);

export default log;
