'use strict';
module.exports = {
  edgeType: {
    Gateway: 1,
    Device: 2
  },
  connectType: {
    MQTT: 1,
    DCCS: 2
  },
  protocol: {
    TCP: 1,
    WebSocket: 2
  },
  actionType: {
    create: 1,
    update: 2,
    delete: 3
  },
  SCADAConfigType: {
    SCADA: 1,
    gateway: 2,
    virtualGroup: 3
  },
  TagType: {
    Analog: 1,
    Discrete: 2,
    Text: 3
  },
  status: {
    Offline: 0,
    Online: 1
  },
  MessageType: {
    WriteValue: 0,
    WriteConfig: 1,
    TimeSync: 2,
    ConfigAck: 3
  }
};
