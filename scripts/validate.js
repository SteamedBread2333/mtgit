/**
 * @file validate.js
 * @description validate repo and commit
 * @author pipi
 */
const fs = require('fs'); // File system operations
const path = require('path'); // Path module
const { execSync } = require('child_process'); // For executing Git commands

/**
 * Validate if the provided path is a valid Git repository
 * @param {string} repoPath 
 * @returns {boolean} isValid
 */
function validateRepo(repoPath) {
  const gitDirPath = path.join(repoPath, '.git');
  if (!fs.existsSync(gitDirPath)) {
    console.log(`\x1b[31mError: The path "${repoPath}" does not seem to be a valid Git repository (missing .git directory).\x1b[0m`);
    return false;
  }
  return true;
};

/**
 * Check if the current commit in repoB matches the commit specified in the config file
 * @param {string} repoPath 
 * @param {string} flagCommit 
 * @returns {boolean} isValid
 */
function validateFlagCommit(repoPath, flagCommit) {
  const currentRepoToCommit = execSync(
    `git --git-dir=${repoPath}/.git --work-tree=${repoPath} rev-parse HEAD`,
    { encoding: 'utf8' }
  ).trim();
  console.log(`\x1b[34mCurrent commit in ${repoPath}:\x1b[0m`, `\x1b[32m${currentRepoToCommit}\x1b[0m`);
  if (!currentRepoToCommit.includes(flagCommit)) {
    console.log(`\x1b[31mError: The current commit: ${currentRepoToCommit} in ${repoPath} does not match the flag commit(${flagCommit}) specified in the config file.\x1b[0m`);
    return false
  }
  return true;
}

module.exports = {
  validateRepo,
  validateFlagCommit
};