const path = require('path');
const debug = require('debug');
const fs = require('fs');
const fsExtra = require('fs-extra');
const paths = require('../config/paths');
const execSync = require('child_process').execSync;
const commandExistsSync = require('command-exists').sync;
require('../config/environment');

debug.enable('sentry.io.deploy:*');
const loginfo = debug('sentry.io.deploy:info');
const logerror = debug('sentry.io.deploy:error');
const COMPILED = paths.COMPILED;
const DIST = paths.DIST;
const temp = path.join(__dirname, '..', 'temp');
const dirClient = path.join(temp, 'sentryClient');
const dirServer = path.join(temp, 'sentryServer');

const release = require(path.join(COMPILED, 'metadata.json')).release; // eslint-disable-line
const organization = process.env.SENTRY_ORGANIZATION;
const project = process.env.SENTRY_PROJECT;
const authToken = process.env.SENTRY_AUTH_TOKEN;
const deploy = process.env.SENTRY_DEPLOY === 'true';
const clientUrlPrefix = process.env.SENTRY_CLIENT_URL_PREFIX;
const ableToDeploy = deploy && organization && project && authToken && clientUrlPrefix;

function walkSync(dir, recursive, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || []; // eslint-disable-line
  files.forEach(file => {
    if (recursive && fs.lstatSync(`${dir}/${file}`).isDirectory()) {
      filelist = walkSync(`${dir}/${file}`, recursive, filelist); // eslint-disable-line
    } else if (file.endsWith('.js')) {
      filelist.push({file: file, full: `${dir}/${file}`}); // eslint-disable-line
    }
  });
  return filelist;
}

function copyFromList(list, dest) {
  list.forEach(o => {
    const mapFile = `${o.full}.map`;
    fsExtra.copySync(o.full, path.join(dest, o.file));
    if (fs.existsSync(mapFile)) {
      fsExtra.copySync(mapFile, path.join(dest, `${o.file}.map`));
    }
  });
}

function addSourceMapToFiles(list) {
  list.forEach(o => {
    const mapFileName = `${o.file}.map`;
    const mapFile = `${o.full}.map`;
    if (fs.existsSync(mapFile)) {
      const sourceMapString = `\n//# sourceMappingURL=${mapFileName}`;
      fs.appendFileSync(o.full, sourceMapString);
    }
  });
}

function copyJSAndMaps() {
  const serverFiles = walkSync(COMPILED);
  const clientFiles = walkSync(DIST, true);

  if (!fs.existsSync(temp)) {
    fs.mkdirSync(temp);
    fs.mkdirSync(dirClient);
    fs.mkdirSync(dirServer);
  }
  copyFromList(serverFiles, dirServer);
  copyFromList(clientFiles, dirClient);
}

function addSourceLocation() {
  const sentryClientFiles = walkSync(dirClient);
  addSourceMapToFiles(sentryClientFiles);
  // const sentryServerFiles = walkSync(dirServer);
  // addSourceMapToFiles(sentryServerFiles);
}

function deployToSentry() {
  // const sentryExists = execSync('which fucker').toString();
  const sentryExists = commandExistsSync('sentry-cli');
  if (!sentryExists) {
    logerror('sentry-cli is required to deploy to sentry.io');
    return;
  }
  try {
    loginfo(`creating release ${release}`);
    execSync(`sentry-cli --auth-token ${authToken} releases -o ${organization} -p ${project} new ${release}`).toString();
    loginfo(`release ${release} created`);
    loginfo('copying client files');
    const clientOutput = execSync(`sentry-cli --auth-token ${authToken} releases -o ${organization} -p ${project} files ${release} upload-sourcemaps --url-prefix ${clientUrlPrefix} ${dirClient}`);
    loginfo(clientOutput.toString());
    loginfo('client files copied');
    loginfo('copying server files');
    const serverOutput = execSync(`sentry-cli --auth-token ${authToken} releases -o ${organization} -p ${project} files ${release} upload-sourcemaps --url-prefix ${COMPILED} ${dirServer}`);
    loginfo(serverOutput.toString());
    loginfo('server files copied');
  } catch (ex) {
    logerror('there was an error');
    logerror(ex);
  }
}

function removeFolders(folder) {
  if (fs.existsSync(folder)) {
    fs.readdirSync(folder).forEach((file) => {
      const curPath = `${folder}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        removeFolders(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folder);
  }
}

if (ableToDeploy) {
  copyJSAndMaps();
  loginfo('copied js files and maps');
  addSourceLocation();
  loginfo('added source to the js files');
  loginfo('deploying to sentry');
  deployToSentry();
  loginfo('removing temp folders');
  removeFolders(temp);
  loginfo('finished');
}
