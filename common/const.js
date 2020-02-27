'use strict';
const path = require('path');
module.exports = {
  DEAFAULT_DATARECOVER_INTERVAL: 3000,
  DEAFAULT_DATARECOVER_COUNT: 10,
  configFilePath: path.resolve(process.cwd(), './config.json'),
  edgentConfig: ''
};
