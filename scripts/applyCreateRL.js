const readline = require('readline');

/**
 * Creates a readline interface for user input.
 * @returns { readline.Interface }
 */
module.exports = function () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return rl;
}