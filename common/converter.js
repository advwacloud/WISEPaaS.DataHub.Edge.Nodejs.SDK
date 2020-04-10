
'use strict';
const assert = require('assert');
const fs = require('fs');
const configMessage = require('../model/MQTTMessages/ConfigMessage');
const { DataMessage } = require('../model/MQTTMessages/DataMessage');
const { DeviceStatusMessage } = require('../model/MQTTMessages/DeviceStatusMessage');
const constant = require('./const');

function _convertWholeConfig (action, nodeId, edgeConfig, heartBeat) {
  try {
    const msg = new configMessage.ConfigMessage();
    msg.d.Action = action;
    const nodeObj = new configMessage.NodeObject(nodeId, edgeConfig, heartBeat);
    for (var device of edgeConfig.node.deviceList) {
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
      nodeObj.Device[device.id] = deviceObj;
      // console.log(deviceObj);
    }
    // console.log(nodeObj);
    msg.d.Scada[nodeId] = nodeObj;
    return msg;
  } catch (error) {
    throw Error('Convert edge config to MQTT format error! error message: ' + error);
  }
}
function _convertData (data, nodeId) {
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
    if (fs.existsSync(constant.configFilePath)) {
      _checkTypeOfTagValue(tag, nodeId);
      msg.d[tag.deviceId][tag.tagName] = _fractionDisplayFormat(tag, nodeId);
    } else {
      msg.d[tag.deviceId][tag.tagName] = tag.value;
    }
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
function _fractionDisplayFormat (tag, nodeId) {
  try {
    let edgentConfig = JSON.parse(constant.edgentConfig);
    if (edgentConfig.Scada[nodeId].Device[tag.deviceId].Tag[tag.tagName]) {
      let fractionVal = edgentConfig.Scada[nodeId].Device[tag.deviceId].Tag[tag.tagName].FDF;
      if (fractionVal) {
        if (typeof (tag.value) !== 'object') {
          return Math.floor(tag.value * Math.pow(10, fractionVal)) / Math.pow(10, fractionVal);
        } else {
          for (let key in tag.value) {
            tag.value[key] = Math.floor(tag.value[key] * Math.pow(10, fractionVal)) / Math.pow(10, fractionVal);
          }
          return tag.value;
        }
      } else {
        return tag.value;
      }
    }
  } catch (err) {
    console.error('_fractionDisplayFormat ' + err);
    throw Error(err);
  }
}
function _checkTypeOfTagValue (tag, nodeId) {
  let edgentConfig = JSON.parse(constant.edgentConfig);
  if (edgentConfig.Scada[nodeId].Device[tag.deviceId].Tag[tag.tagName]) {
    let type = edgentConfig.Scada[nodeId].Device[tag.deviceId].Tag[tag.tagName].Type;
    switch (type) {
      case 1:
        if (typeof (tag.value) !== 'object') {
          if (typeof (tag.value) !== 'number') {
            throw Error('Tag Name: ' + tag.tagName + '. Type of value type is not number');
          }
        } else {
          for (let key in tag.value) {
            if (typeof (tag.value[key]) !== 'number') {
              throw Error('Tag Name: ' + tag.tagName + ', index: ' + key + ' type is not number');
            }
          }
        }
        break;
      case 2:
        let RegExp = /^\d+$/;
        if (typeof (tag.value) !== 'object') {
          let res = RegExp.test(tag.value);
          if (!res) {
            throw Error('Tag Name: ' + tag.tagName + '. Type of value is not positive integer.');
          }
        } else {
          for (let key in tag.value) {
            if (!RegExp.test(tag.value[key])) {
              throw Error('Tag Name: ' + tag.tagName + ', index: ' + key + ' type is not positive integer.');
            }
          }
        }

        break;
      case 3:
        if (typeof (tag.value) !== 'object') {
          if (typeof (tag.value) !== 'string') {
            throw Error('Tag Name: ' + tag.tagName + '. Type of value is not string.');
          }
        } else {
          for (let key in tag.value) {
            if (typeof (tag.value[key]) !== 'string') {
              throw Error('Tag Name: ' + tag.tagName + ', index: ' + key + ' type is not string');
            }
          }
        }

        break;
    }
  }
}
module.exports = {
  convertWholeConfig: _convertWholeConfig,
  convertData: _convertData,
  convertDeviceStatus: _convertDeviceStatus
};
