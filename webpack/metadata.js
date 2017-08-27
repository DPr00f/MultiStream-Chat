const config = require('../package.json');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '..', 'build');
const file = path.join(dir, 'metadata.json');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

if (!fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify({
    release: config.version
  }));
}
