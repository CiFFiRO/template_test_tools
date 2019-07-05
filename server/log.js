const fs = require('fs');

module.exports = class Log {
  constructor(path) {
    this.fileName = path;
  }

  log(message) {
    fs.appendFile(this.fileName, 'LOG @ ' + (new Date(Date.now())) + ': ' + message + '\n', error => {});
  }

  warning(message) {
    fs.appendFile(this.fileName, 'WARNING @ ' + (new Date(Date.now())) + ': ' + message + '\n', error => {});
  }

  error(message) {
    fs.appendFile(this.fileName, 'ERROR @ ' + (new Date(Date.now())) + ': ' + message + '\n', error => {});
  }

  fatal(message) {
    fs.appendFileSync(this.fileName, 'FATAL ERROR @ ' + (new Date(Date.now())) + ': ' + message + '\n', error => {});
  }
};