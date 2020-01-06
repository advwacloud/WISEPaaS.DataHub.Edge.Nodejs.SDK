
'use strict';
const assert = require('assert');
const configMessage = require('../model/MQTTMessages/ConfigMessage');
const { DataMessage } = require('../model/MQTTMessages/DataMessage');
const { DeviceStatusMessage } = require('../model/MQTTMessages/DeviceStatusMessage');

function _convertWholeConfig (action, scadaId, edgeConfig, heartBeat) {
  try {
    const msg = new configMessage.ConfigMessage();
    msg.d.Action = action;
    const scadaObj = new configMessage.ScadaObject(scadaId, edgeConfig, heartBeat);
    for (var device of edgeConfig.scada.deviceList) {
      assert(device.id, 'Device Id is required, please check the edge config properties.');
      assert(device.name, 'Device name is required, please check the edge config properties.');
      assert(device.type, 'Device type is required, please check the edge config properties.');
      const deviceObj = new configMessage.DeviceObject(device);
      if (device.analogTagList && device.analogTagList.length !== 0) {
        for (const anaTag of device.analogTagList) {
          assert(anaTag.name, 'Analog tag name is required, please check the edge config properties.');
          const analogTagObj = new configMessage.AnalogTagObject(anaTag);
          deviceObj.Tag[anaTag.name] = analogTagObj;
        }
      }
      if (device.discreteTagList && device.discreteTagList.length !== 0) {
        for (const disTag of device.discreteTagList) {
          assert(disTag.name, 'Discrete tag name is required, please check the edge config properties.');
          const disTagObj = new configMessage.DiscreteTagObject(disTag);
          deviceObj.Tag[disTag.name] = disTagObj;
        }
      }
      if (device.textTagList && device.textTagList.length !== 0) {
        for (const textTag of device.textTagList) {
          assert(textTag.name, 'Text tag name is required, please check the edge config properties.');
          const textTagObj = new configMessage.TextTagObject(textTag);
          deviceObj.Tag[textTag.name] = textTagObj;
        }
      }
      scadaObj.Device[device.id] = deviceObj;
      // console.log(deviceObj);
    }
    // console.log(scadaObj);
    msg.d.Scada[scadaId] = scadaObj;
    return msg;
  } catch (error) {
    throw Error('Convert edge config to MQTT format error! error message: ' + error);
  }
}
function _convertData (data) {
  const result = [];
  let msg = new DataMessage();
  let count = 0;
  for (let i = 0; i < data.tagList.length; i++) {
    const tag = data.tagList[i];
    assert(tag.deviceId, 'Device ID is required when call the sendData function.');
    assert(tag.tagName, 'Tag name is required when call the sendData function.');
    if (!msg.d[tag.deviceId]) {
      msg.d[tag.deviceId] = {};
    }
    msg.d[tag.deviceId][tag.tagName] = tag.value;
    count++;
    if (count === 100 || i === data.tagList.length - 1) {
      msg.ts = data.ts;
      result.push(msg);
      msg = new DataMessage();
      count = 0;
    }
  }
  return result;
}
function _convertDeviceStatus (deviceStatus) {
  try {
    if (Object.keys(deviceStatus).length === 0) {
      return;
    }
    const msg = new DeviceStatusMessage();
    msg.ts = deviceStatus.ts;
    for (const device of deviceStatus.deviceList) {
      assert(device.id, 'Device ID is required when call the updateDeviceStatus function.');
      msg.d.Dev[device.id] = device.status;
    }
    return msg;
  } catch (error) {
    console.log('error occured in convertDeviceStatus function, error: ' + error);
  }
}
module.exports = {
  convertWholeConfig: _convertWholeConfig,
  convertData: _convertData,
  convertDeviceStatus: _convertDeviceStatus
};
