'use strict';
const { EdgeAgent } = require('./EdgeAgent');
const edgeConfig = require('./model/edge/EdgeConfig');
const { EdgeData, EdgeDataTag } = require('./model/edge/EdgeData');
const { EdgeDeviceStatus, DeviceStatus } = require('./model/edge/EdgeDeviceStatus');
const edgeEnum = require('./common/enum');
module.exports = {
  EdgeAgent,
  EdgeConfig: edgeConfig.EdgeConfig,
  NodeConfig: edgeConfig.NodeConfig,
  DeviceConfig: edgeConfig.DeviceConfig,
  AnalogTagConfig: edgeConfig.AnalogTagConfig,
  DiscreteTagConfig: edgeConfig.DiscreteTagConfig,
  TextTagConfig: edgeConfig.TextTagConfig,
  EdgeData: EdgeData,
  EdgeDataTag: EdgeDataTag,
  EdgeDeviceStatus: EdgeDeviceStatus,
  DeviceStatus: DeviceStatus,
  constant: edgeEnum
};
