'use strict';
const { status } = require('../../common/enum');
class DeviceStatus {
  constructor () {
    this.id = '';
    this.status = status.Offline;
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
