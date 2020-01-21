'use strict';
const { BaseMessage } = require('./BaseMessage');
const { actionType, SCADAConfigType, TagType } = require('../../common/enum');
class DObject {
  constructor () {
    this.Action = actionType.create;
    this.Scada = {};
    return this;
  }
}
class ConfigMessage extends BaseMessage {
  constructor () {
    super();
    this.d = new DObject();
    return this;
  }
}
class ScadaObject {
  constructor (scadaId, scadaConfig, heartBeat) {
    this.Id = scadaId;
    this.Name = scadaConfig.scada.name;
    if (scadaConfig.scada.description) {
      this.Desc = scadaConfig.scada.description;
    }
    if (scadaConfig.scada.primaryIP) {
      this.PIP = scadaConfig.scada.primaryIP;
    }
    if (scadaConfig.scada.backupIP) {
      this.BIP = scadaConfig.scada.backupIP;
    }
    if (scadaConfig.scada.primaryPort) {
      this.PPort = scadaConfig.scada.primaryPort;
    }
    if (scadaConfig.scada.backupPort) {
      this.BPort = scadaConfig.scada.backupPort;
    }
    this.Hbt = heartBeat / 1000;
    this.Type = SCADAConfigType.SCADA;// 這是固定的?
    this.Device = {};
    return this;
  }
}
class DeviceObject {
  constructor (deviceConfig) {
    this.Name = deviceConfig.name;
    this.Type = deviceConfig.type;
    if (deviceConfig.description) {
      this.Desc = deviceConfig.description;
    }
    if (deviceConfig.IP) {
      this.IP = deviceConfig.IP;
    }
    if (deviceConfig.port) {
      this.Port = deviceConfig.port;
    }
    if (deviceConfig.portNumber) {
      this.PNbr = deviceConfig.portNumber;
    }
    if (deviceConfig.rp) {
      this.RP = deviceConfig.rp;
    }
    this.Tag = {};
    return this;
  }
}
class TagObject {
  constructor (tagType, tagConfig) {
    this.Type = tagType;
    this.Desc = tagConfig && tagConfig.description ? tagConfig.description : '';
    this.RO = tagConfig && tagConfig.readOnly ? tagConfig.readOnly : 0;
    this.Ary = tagConfig && tagConfig.arraySize ? tagConfig.arraySize : 0;
  }
}
class AnalogTagObject extends TagObject {
  constructor (analogConfig) {
    super(TagType.Analog, analogConfig);
    this.SH = analogConfig && analogConfig.spanHigh ? analogConfig.spanHigh : 1000;
    this.SL = analogConfig && analogConfig.spanLow ? analogConfig.spanLow : 0;
    this.EU = analogConfig && analogConfig.engineerUnit ? analogConfig.engineerUnit : '';
    this.IDF = analogConfig && analogConfig.integerDisplayFormat ? analogConfig.integerDisplayFormat : 4;
    this.FDF = analogConfig && analogConfig.fractionDisplayFormat ? analogConfig.fractionDisplayFormat : 2;
    this.SCALE = analogConfig && analogConfig.scalingType ? analogConfig.scalingType : 0;
    this.SF1 = analogConfig && analogConfig.scalingFactor1 ? analogConfig.scalingFactor1 : 0;
    this.SF2 = analogConfig && analogConfig.scalingFactor2 ? analogConfig.scalingFactor2 : 0;
    return this;
  }
}
class DiscreteTagObject extends TagObject {
  constructor (discreteConfig) {
    super(TagType.Discrete, discreteConfig);
    this.S0 = discreteConfig && discreteConfig.state0 ? discreteConfig.state0 : 'NotUsed';
    this.S1 = discreteConfig && discreteConfig.state1 ? discreteConfig.state1 : 'NotUsed';
    this.S2 = discreteConfig && discreteConfig.state2 ? discreteConfig.state2 : 'NotUsed';
    this.S3 = discreteConfig && discreteConfig.state3 ? discreteConfig.state3 : 'NotUsed';
    this.S4 = discreteConfig && discreteConfig.state4 ? discreteConfig.state4 : 'NotUsed';
    this.S5 = discreteConfig && discreteConfig.state5 ? discreteConfig.state5 : 'NotUsed';
    this.S6 = discreteConfig && discreteConfig.state6 ? discreteConfig.state6 : 'NotUsed';
    this.S7 = discreteConfig && discreteConfig.state7 ? discreteConfig.state7 : 'NotUsed';
    return this;
  }
}
class TextTagObject extends TagObject {
  constructor (textConfig) {
    super(TagType.Text, textConfig);

    return this;
  }
}
module.exports = {
  ConfigMessage,
  ScadaObject,
  DeviceObject,
  AnalogTagObject,
  DiscreteTagObject,
  TextTagObject
};
