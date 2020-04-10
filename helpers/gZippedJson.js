'use strict';
const zlib = require('zlib');
function compressToBase64String (message) {
  try {
    if (JSON.stringify(message) === '' || Object.keys(message).length === 0) {
      return '';
    }
    let rawData = Buffer.from(JSON.stringify(message));
    // console.log(rawData);
    let zippedData = zlib.gzipSync(rawData);
    let res = Buffer.from(zippedData).toString('base64');
    return res;
  } catch (error) {
    console.error('compress to base64 to string error: ' + error);
  }
}
function decompressFromBase64String (message) {
  try {
    let buff = Buffer.from(message, 'base64');
    let zippedData = zlib.unzipSync(buff);
    let res = zippedData.toString();
    return res;
  } catch (error) {
    console.error('decompress from base64 to string error: ' + error);
  }
}
module.exports = {
  compressToBase64String,
  decompressFromBase64String
};
