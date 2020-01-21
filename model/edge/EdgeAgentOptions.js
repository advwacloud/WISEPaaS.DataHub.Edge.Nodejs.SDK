'use strict';
const assert = require('assert');
const { connectType, edgeType, protocol } = require('../../common/enum');
class EdgeAgentOptions {
  constructor (options) {
    assert(options, 'No options to init EdgeAgent.');
    assert(options.scadaId, 'Scada ID is required.');
    this.autoReconnect = options.autoReconnect ? options.autoReconnect : false;
    this.reconnectInterval = options.reconnectInterval ? options.reconnectInterval : 1000;
    this.scadaId = options.scadaId ? options.scadaId : '';
    this.deviceId = options.deviceId ? options.deviceId : '';
    this.type = options.type && options.type <= Object.keys(edgeType).length ? options.type : edgeType.Gateway;
    this.heartbeat = options.heartbeat ? options.heartbeat : 60000;
    this.dataRecover = options.dataRecover ? options.dataRecover : true;
    this.connectType = options.connectType && options.connectType <= Object.keys(connectType).length ? options.connectType : connectType.DCCS;
    this.useSecure = options.useSecure ? options.useSecure : false;

    if (options.connectType === connectType.MQTT) {
      // if (!options.MQTT) {
      //   options.MQTT = {};
      // }
      this.MQTT = new MQTTOption(options.MQTT);
    } else {
      assert(options.DCCS.credentialKey, 'DCCS credentialkey is required, please check the options for new an edgeAgent.');
      assert(options.DCCS.APIUrl, 'DCCS APIUrl is required, please check the options for new an edgeAgent.');
      this.DCCS = new DCCSOptions(options.DCCS);
    }
    return this;
  }
}
class DCCSOptions {
  constructor (options) {
    this.credentialKey = options.credentialKey ? options.credentialKey : '';
    this.APIUrl = options.APIUrl ? options.APIUrl : '';
    return this;
  }
}
class MQTTOption {
  constructor (options) {
    this.host = options.hostName ? options.hostName : '';
    this.port = options.port ? options.port : 1883;
    this.username = options.username ? options.username : '';
    this.password = options.password ? options.password : '';
    this.protocolType = options.protocolType ? options.protocolType : protocol.TCP;
    return this;
  }
}
module.exports = {
  EdgeAgentOptions
};
