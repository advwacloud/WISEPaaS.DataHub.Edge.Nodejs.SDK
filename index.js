'use strict';
const events = require('events').EventEmitter;
const { EdgeAgentOptions } = require('./model/edge/EdgeAgentOptions');
const { actionType, edgeType, MessageType } = require('./common/enum');
const connHelper = require('./helpers/connectHelper');
const dataRecoverHelper = require('./helpers/dataRecoverHelper');
const converter = require('./common/converter');
const constant = require('./common/const');
const { HeartBeatMessage } = require('./model/MQTTMessages/HeartBeatMessage');
const { ConnectMessage } = require('./model/MQTTMessages/ConnectMessage');
const edgeConfig = require('./model/edge/EdgeConfig');
const { EdgeData, Tag } = require('./model/edge/EdgeData');
const { EdgeDeviceStatus, DeviceStatus } = require('./model/edge/EdgeDeviceStatus');
const { DisconnectMessage } = require('./model/MQTTMessages/DisconnectMessage');
const { WriteValueCommand } = require('./model/edge/WriteValueCommand');

class EdgeAgent {
  constructor (options) {
    this._options = new EdgeAgentOptions(options);
    this._client = {};
    this._heartBeatInterval = {};
    this._dataRecoverInteval = {};
    // this._recoverHelper = new DataRecoverHelper();
    this.events = new events.EventEmitter();
    this._mqttTopic = {
      // scadaCmdTopic: `/wisepaas/scada/${options.scadaId}/cmd`,
      // deviceCmdTopic: `/wisepaas/scada/${options.scadaId}/${options.deviceId}/cmd`,
      _configTopic: `/wisepaas/scada/${options.scadaId}/cfg`,
      _dataTopic: `/wisepaas/scada/${options.scadaId}/data`,
      _scadaConnTopic: `/wisepaas/scada/${options.scadaId}/conn`,
      _deviceConnTopic: `/wisepaas/scada/${options.scadaId}/${options.deviceId}/conn`,
      _ackTopic: `/wisepaas/scada/${options.scadaId}/ack`,
      _cfgAckTopic: `/wisepaas/scada/${options.scadaId}/cfgack`,
      _cmdTopic: options.type === edgeType.Gateway ? `/wisepaas/scada/${options.scadaId}/cmd` : `/wisepaas/scada/${options.scadaId}/${options.deviceId}/cmd`
    };
    // dataRecoverHelper.init();
  }

  connect (callback) {
    let result = true;
    callback = callback || function () { };
    return new Promise((resolve, reject) => {
      try {
        if (Object.keys(this._options) === 0) {
          result = false;
          const err = Error('Edge agent options is required.');
          reject(err);
          return callback(err, result);
        }
        connHelper._connectMQTTorDCCS.call(this).then((client) => {
          this._client = client;
          initEventFunction.call(this);
          callback(null, result);
          resolve(true);
        }, error => {
          result = false;
          console.log(error.message);
          reject(error);
          callback(error, result);
        });
      } catch (error) {
        callback(error, result);
        reject(error);
      }
    });
  }

  disconnect (callback) {
    let result = true;
    callback = callback || function () { };
    return new Promise((resolve, reject) => {
      try {
        if (typeof this._client.on !== 'function') {
          result = false;
          const err = Error('Mqtt is disconnected.');
          reject(err);
          return callback(err, result);
        }
        const msg = new DisconnectMessage();
        const topic = this._options.type === edgeType.Gateway ? this._mqttTopic._scadaConnTopic : this._mqttTopic._deviceConnTopic;
        this._client.publish(topic, JSON.stringify(msg), { qos: 1, retain: true }, closeMQTTClient.bind(this, this.disconnected));
        clearInterval(this._heartBeatInterval);
        callback(null, result);
        resolve(result);
      } catch (error) {
        console.log('Disconnect error: ' + error);
        result = false;
        callback(error, result);
        reject(error);
      }
    });
  }

  uploadConfig (action, edgeConfig, callback) {
    let result = true;
    callback = callback || function () { };
    return new Promise((resolve, reject) => {
      try {
        let message = {};
        if (!this._client.connected) {
          result = false;
          const err = Error('Mqtt is connection is not exist.');
          reject(err);
          return callback(err, result);
        }
        if (Object.keys(edgeConfig) === 0) {
          result = false;
          const err = Error('Edge config can not be empty.');
          reject(err);
          return callback(err, result);
        }
        switch (action) {
          case actionType.create:
            message = converter.convertWholeConfig(action, this._options.scadaId, edgeConfig, this._options.heartbeat);
            break;
          case actionType.update:
            break;
          case actionType.delete:
            break;
        }
        if (Object.keys(message) !== 0) {
          this._client.publish(this._mqttTopic._configTopic, JSON.stringify(message), { qos: 1 });
        }
        callback(null, result);
        resolve(true);
      } catch (error) {
        result = false;
        console.log(error);
        callback(error, result);
        reject(error);
      }
    });
  }

  sendData (data, callback) {
    let result = true;
    callback = callback || function () { };
    return new Promise((resolve, reject) => {
      try {
        if (Object.keys(data).length === 0) {
          result = false;
          const err = Error('Data is required.');
          reject(err);
          return callback(err, result);
        }
        const msgArray = converter.convertData(data);
        if (this._client.connected === false) {
          dataRecoverHelper.write(msgArray);
        } else {
          for (const msg of msgArray) {
            this._client.publish(this._mqttTopic._dataTopic, JSON.stringify(msg), { qos: 1 }, (error) => {
              if (error) {
                dataRecoverHelper.write(msg);
                console.log('publish error = ' + error);
              }
            });
          }
        }
        callback(null, result);
        resolve(true);
      } catch (error) {
        result = false;
        console.log(error);
        reject(error);
        callback(error, result);
      }
    });
  }

  sendDeviceStatus (devieStatus, callback) {
    let result = true;
    callback = callback || function () { };
    return new Promise((resolve, reject) => {
      try {
        const msg = converter.convertDeviceStatus(devieStatus);
        this._client.publish(this._mqttTopic._scadaConnTopic, JSON.stringify(msg), { qos: 1, retain: true });
        resolve(true);
        callback(null, result);
      } catch (error) {
        result = false;
        console.log('Send device status error: ' + error);
        reject(error);
        callback(error, result);
      }
    });
  }
}
function initEventFunction () {
  this._client.on('connect', _mqttConnected.bind(this));
  this._client.on('close', _mqttDisconnected.bind(this));
  this._client.on('message', (topic, message, packet) => {
    _mqttMessageReceived.call(this, topic, message, packet);
  });
}
function _mqttConnected (customerCallback) {
  try {
    this.events.emit('connected');
    sendConnectMessage.call(this);
    if (this._options.heartbeat > 0) {
      this._heartBeatInterval = setInterval(sendHeartBeatMessage.bind(this), this._options.heartbeat);
    }
    if (this._options.dataRecover) {
      dataRecoverHelper.init();
      this._dataRecoverInteval = setInterval(dataRecoverMessage.bind(this), constant.DEAFAULT_DATARECOVER_INTERVAL);
    }
    this._client.subscribe(this._mqttTopic._cmdTopic);
    this._client.subscribe(this._mqttTopic._ackTopic);
  } catch (error) {
    console.error('_mqttConnected function error: ' + error);
  }
}
function _mqttDisconnected () {
  try {
    this.events.emit('disconnected');
    clearInterval(this._heartBeatInterval);
    clearInterval(this._dataRecoverInteval);
  } catch (error) {
    console.error('_mqttDisconnected function error: ' + error);
  }
}
function _mqttMessageReceived (topic, message, packet) {
  try {
    const msg = JSON.parse(message.toString());
    const result = {};
    let resMsg = {};
    if (!msg || !msg.d) {
      return;
    }
    if (msg.d.Cmd !== undefined) {
      switch (msg.d.Cmd) {
        case 'WV':
          resMsg = new WriteValueCommand();
          for (const devObj in msg.d.Val) {
            const device = new WriteValueCommand.Device();
            // console.log(devObj);
            device.id = devObj;
            for (const tagObj in msg.d.Val[devObj]) {
              const tag = new WriteValueCommand.Tag();
              tag.name = tagObj;
              tag.value = msg.d.Val[devObj][tagObj];
              device.tagList.push(tag);
            }
            resMsg.deviceList.push(device);
          }
          result.type = MessageType.WriteValue;
          result.message = resMsg;
          // messageReceived(result);
          this.events.emit('messageReceived', result);
          break;
        case 'WC':
          break;
        case 'TSyn':
          break;
      }
    } else if (msg.d.Cfg) {
      result.type = MessageType.ConfigAck;
      result.message = msg.d.Cfg === 1;
      this.events.emit('messageReceived', result);
    }
  } catch (error) {
    console.log('_mqttMessageReceived function error: ' + error);
  }
}
function dataRecoverMessage () {
  if (this._client.connected === false) {
    return;
  }
  dataRecoverHelper.dataAvailable((res) => {
    if (res) {
      dataRecoverHelper.read(constant.DEAFAULT_DATARECOVER_COUNT, (message) => {
        for (const msg of message) {
          this._client.publish(this._mqttTopic._dataTopic, msg, { qos: 1 });
        }
      });
    }
  });
}
function sendHeartBeatMessage () {
  const msg = new HeartBeatMessage();
  const topic = this._options.type === edgeType.Gateway ? this._mqttTopic._scadaConnTopic : this._mqttTopic._deviceConnTopic;
  this._client.publish(topic, JSON.stringify(msg), { qos: 1, retain: true });
}
function sendConnectMessage () {
  const msg = new ConnectMessage();
  const topic = this._options.type === edgeType.Gateway ? this._mqttTopic._scadaConnTopic : this._mqttTopic._deviceConnTopic;
  this._client.publish(topic, JSON.stringify(msg), { qos: 1, retain: true });
}
function closeMQTTClient () {
  this._client.end(true, []);
}

// function timeConvert (string) {
//   // let timeNow = Date.now();
//   const time = new Date();
//   const showtime = string + ' ' + time.getSeconds() + ':' + time.getMilliseconds();
//   console.log(showtime);
// }

EdgeAgent.EdgeConfig = edgeConfig.EdgeConfig;
EdgeAgent.ScadaConfig = edgeConfig.ScadaConfig;
EdgeAgent.DeviceConfig = edgeConfig.DeviceConfig;
EdgeAgent.AnalogTagConfig = edgeConfig.AnalogTagConfig;
EdgeAgent.DiscreteTagConfig = edgeConfig.DiscreteTagConfig;
EdgeAgent.TextTagConfig = edgeConfig.TextTagConfig;
EdgeAgent.EdgeData = EdgeData;
EdgeAgent.Tag = Tag;
EdgeAgent.EdgeDeviceStatus = EdgeDeviceStatus;
EdgeAgent.DeviceStatus = DeviceStatus;
module.exports = {
  EdgeAgent
};
