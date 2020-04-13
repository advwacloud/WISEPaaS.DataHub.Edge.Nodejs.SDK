'use strict';
const edgeEnum = require('../../common/enum');
class DeviceStatus {
  constructor () {
    this.id = '';
    this.status = edgeEnum.status.Offline;
    return this;
  }
}

class EdgeDeviceStatus {
  constructor () {
    this.deviceList = [];
    this.ts = Date.now();
    return this;
  }
}

module.exports = {
  EdgeDeviceStatus,
  DeviceStatus
};
