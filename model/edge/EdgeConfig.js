'use strict';
class EdgeConfig {
  constructor () {
    this.scada = new ScadaConfig();
    return this;
  }
}
class ScadaConfig {
  constructor () {
    this.name = '';
    this.description = '';
    this.deviceList = [];
    return this;
  }
}
class DeviceConfig {
  constructor () {
    this.id = '';
    this.name = '';
    this.type = '';
    this.description = '';
    this.rp = '';
    this.analogTagList = [];
    this.discreteTagList = [];
    this.textTagList = [];
    return this;
  }
}
class TagConfig {
  constructor () {
    this.name = '';
  }
}
class AnalogTagConfig extends TagConfig {
  constructor () {
    super();
    // this.name = 'ATag';
    this.description = '';
    this.readOnly = false;
    this.arraySize = 0;
    this.spanHigh = 1000;
    this.spanLow = 0;
    this.engineerUnit = '';
    this.integerDisplayFormat = 4;
    this.fractionDisplayFormat = 2;
    return this;
  }
}
class DiscreteTagConfig extends TagConfig {
  constructor () {
    super();
    // this.name = 'DTag';
    this.description = ' ';
    this.readOnly = false;
    this.arraySize = 0;
    this.state0 = '0';
    this.state1 = '1';
    this.state2 = 'NotUsed';
    this.state3 = 'NotUsed';
    this.state4 = 'NotUsed';
    this.state5 = 'NotUsed';
    this.state6 = 'NotUsed';
    this.state7 = 'NotUsed';
    return this;
  }
}
class TextTagConfig extends TagConfig {
  constructor () {
    super();
    // this.name = 'DTag';
    this.description = '';
    this.readOnly = false;
    this.arraySize = 0;
    return this;
  }
}
module.exports = {
  EdgeConfig,
  ScadaConfig,
  DeviceConfig,
  AnalogTagConfig,
  DiscreteTagConfig,
  TextTagConfig
};
