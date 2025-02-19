/**
 * @file index.js
 * @description Synchronizes changes between two Git repositories.
 * @author pipi
 */
const { execSync } = require('child_process'); // For executing Git commands
const fs = require('fs'); // File system operations
const path = require('path'); // Path manipulation
const readline = require('readline'); // User input
const loadConfig = require('./applyConfig'); // Load configuration from a JSON file
const os = require('os'); // Operating system information

// Resolve the home directory in the path
function resolveHomePath(relativePath) {
  const homeDir = os.homedir();
  return path.resolve(homeDir, relativePath.replace(/^~\//, ''));
}

// Validate if the provided path is a valid Git repository
const validateRepo = (repoPath, needValdateGit) => {
  if (!fs.existsSync(repoPath)) {
    console.log(`\x1b[31mError: The path "${repoPath}" does not exist.\x1b[0m`); // Error in red
    return false;
  }
  const gitDirPath = path.join(repoPath, '.git');
  if (!fs.existsSync(gitDirPath)) {
    // If the .git directory is missing, it may be due to a shallow clone
    console.log(`\x1b[${needValdateGit ? 31 : 33}mError: The path "${repoPath}" does not seem to be a valid Git repository (missing .git directory).\x1b[0m`);
    if (needValdateGit) {
      return false;
    }
  }
  return true;
};

/**
 * Handles file changes (additions, modifications, deletions).
 * @param {string} repoA Path to repository A
 * @param {string} repoB Path to repository B
 * @param {string} status Change status (A/M/D)
 * @param {string} srcPath Source file path
 * @param {string} destPath Destination file path
 */
function handleFileChange(repoA, repoB, status, srcPath, destPath) {
  const repoAFile = path.join(repoA, srcPath); // Source file in repo A
  const repoBFile = path.join(repoB, destPath); // Target file in repo B

  switch (status) {
    case 'A': // Copy new file from repo A to repo B
    case 'M': // Update modified file in repo B
      console.log(`\x1b[32mCopying ${srcPath} from ${repoA}\x1b[0m`, '\x1b[34m-->>\x1b[0m', `\x1b[32m${repoB}\x1b[0m`);
      fs.mkdirSync(path.dirname(repoBFile), { recursive: true });
      fs.copyFileSync(repoAFile, repoBFile);
      break;
    case 'D': // Delete file in repo B
      console.log(`\x1b[32mDeleting ${srcPath} from repoB\x1b[0m`);
      if (fs.existsSync(repoBFile)) {
        fs.unlinkSync(repoBFile);
      }
      break;
  }
}

/**
 * Handles file renames by copying the old file to the new path and removing the old file.
 * @param {string} repoA Path to repository A
 * @param {string} repoB Path to repository B
 * @param {string} oldPath Old file path
 * @param {string} newPath New file path
 */
function handleFileRename(repoA, repoB, oldPath, newPath) {
  const repoAOldFile = path.join(repoA, oldPath); // Source file in repo A with old name
  const repoBNewFile = path.join(repoB, newPath); // Target file path in repo B

  console.log(`\x1b[32mRenaming ${oldPath} to ${newPath}\x1b[0m`);
  fs.mkdirSync(path.dirname(repoBNewFile), { recursive: true });
  fs.copyFileSync(repoAOldFile, repoBNewFile);

  // Remove the old file if it exists in repo B
  const repoBOldFile = path.join(repoB, oldPath);
  if (fs.existsSync(repoBOldFile)) {
    fs.unlinkSync(repoBOldFile);
  }
}

/**
 * Synchronizes changes between two Git repositories.
 * @param {string} repoAPath Path to repository A
 * @param {string} repoBPath Path to repository B
 * @param {string} commitA Start commit reference
 * @param {string} commitB End commit reference
 */
function syncRepositories(repoAPath, repoBPath, commitA, commitB, needValdateGit) {
  if (!validateRepo(repoAPath, needValdateGit) || !validateRepo(repoBPath, needValdateGit)) {
    return;
  }
  try {
    // Run Git diff to get file changes (including renames)
    const diffOutput = execSync(
      `git --git-dir=${repoAPath}/.git --work-tree=${repoAPath} diff --name-status --diff-filter=ARM --find-renames=50% ${commitA} ${commitB}`,
      { encoding: 'utf8' }
    ).trim();

    console.log(`\x1b[34mChanges between\x1b[0m`, `\x1b[32m${commitA}\x1b[0m`, `\x1b[34mand\x1b[0m`, `\x1b[32m${commitB}\x1b[0m`, '\n', `\x1b[34m${diffOutput}\x1b[0m`, '\n');

    if (!diffOutput) {
      console.log('No changes to sync.');
      return;
    }

    // Parse the diff output into file status changes
    const fileStatus = diffOutput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    // Process each file change
    fileStatus.forEach(line => {
      const parts = line.split('\t');
      const status = parts[0].trim(); // File status indicating addition, modification, deletion, or rename
      let srcPath, destPath;

      switch (status) {
        case 'A': // Added file
        case 'M': // Modified file
        case 'D': // Deleted file
          srcPath = parts[1];
          destPath = srcPath;
          handleFileChange(repoAPath, repoBPath, status, srcPath, destPath);
          break;
        case 'R': // Renamed file
          const renameParts = line.split('\t');
          const oldPath = renameParts[1];
          const newPath = renameParts[2];
          handleFileRename(repoAPath, repoBPath, oldPath, newPath);
          break;
      }
    });

    // Ask the user for confirmation before committing changes
    console.log('\x1b[33mAll changes have been applied to repoB. Do you want to commit these changes? (y/n)\x1b[0m');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('', (answer) => {
      if (answer.trim().toLowerCase() === 'y') {
        // Commit changes to repository B
        execSync(
          `git --git-dir=${repoBPath}/.git --work-tree=${repoBPath} add . && git --git-dir=${repoBPath}/.git --work-tree=${repoBPath} commit -m "Synced changes from ${path.basename(repoAPath)}"`,
          { stdio: 'inherit' }
        );
        console.log('\x1b[32mChanges committed to repoB.\x1b[0m'); // Success message in green
      } else {
        console.log('\x1b[32mChanges not committed.\x1b[0m'); // Info message in green
      }
      rl.close();
    });

  } catch (error) {
    console.log(`\x1b[31mError syncing repositories:\n${error}\x1b[0m`); // Error message in red
  }
}

// Load configuration from a JSON file
const config = loadConfig('config.json'); // Example path to config.json
const { repoFromPath, repoToPath, commitFrom, commitTo, needValdateGit } = config;
// Start the synchronization process with the loaded parameters
syncRepositories(resolveHomePath(repoFromPath), resolveHomePath(repoToPath), commitFrom, commitTo, needValdateGit);