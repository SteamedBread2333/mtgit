/**
 * @file applyResolveHomePath.js
 * @description Resolve the home directory in the path
 * @author pipi
 */
const os = require('os'); // Operating system information
const path = require('path'); // Path module

/**
 * Resolve the home directory in the path
 * @param {*} relativePath 
 * @returns {*} resolvedPath
 */
module.exports = function (relativePath) {
  const homeDir = os.homedir();
  return path.resolve(homeDir, relativePath.replace(/^~\//, ''));
}