const CryptoJS = require('crypto-js');
const zlib = require('zlib');

function getHash(string) {
  return CryptoJS.SHA256(string).toString(CryptoJS.enc.Hex);
}

function timeNow() {
  return Math.floor(Date.now()/1000);
}

function compressString(data) {
  let input = Buffer.from(data, 'utf8');
  return zlib.deflateSync(input);
}

function uncompressString(data) {
  return zlib.inflateSync(Buffer.from(data, 'base64')).toString();
}

module.exports = {
  getHash: getHash,
  timeNow: timeNow,
  compressString: compressString,
  uncompressString: uncompressString
};