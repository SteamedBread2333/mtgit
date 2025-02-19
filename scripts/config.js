const fs = require('fs');

module.exports = function (filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`\x1b[31mError loading configuration:`, error, '\x1b[0m');
    return null;
  }
}