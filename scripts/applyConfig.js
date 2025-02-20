/**
 * @file applyConfig.js
 * @description read config file
 * @author pipi
 */
const fs = require('fs');

/**
 * Load configuration from a JSON file.
 * @param {*} filePath 
 * @returns {*} config
 */
module.exports = function (filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`\x1b[31mError loading configuration:`, error, '\x1b[0m');
    return null;
  }
}