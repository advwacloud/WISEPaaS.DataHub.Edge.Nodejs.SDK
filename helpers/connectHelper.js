'use strict';
const mqtt = require('mqtt');
const request = require('request-promise');
const { LastWillMessage } = require('../model/MQTTMessages/LastWillMessage');
const { connectType } = require('../common/enum');

function _connectMQTTorDCCS () {
  return new Promise((resolve, reject) => {
    try {
      if (this._options.connectType === connectType.MQTT) {
        this._options.MQTT.will = {
          topic: `/wisepaas/scada/${this._options.scadaId}/conn`,
          payload: JSON.stringify(new LastWillMessage()),
          qos: 1,
          retain: true
        };
        this._options.MQTT.reconnectPeriod = this._options.reconnectInterval;
        const client = mqtt.connect(this._options.MQTT);
        resolve(client);
      } else {
        const reqOpt = {
          uri: this._options.DCCS.APIUrl + 'v1/serviceCredentials/' + this._options.DCCS.credentialKey,
          json: true
        };
        request.get(reqOpt).then(res => {
          const credential = res.credential;
          const mqttOptions = {
            host: res.serviceHost
          };
          if (this._options.useSecure) {
            mqttOptions.port = credential.protocols['mqtt+ssl'].port;
            mqttOptions.userName = credential.protocols['mqtt+ssl'].username;
            mqttOptions.password = credential.protocols['mqtt+ssl'].password;
          } else {
            mqttOptions.port = credential.protocols.mqtt.port;
            mqttOptions.username = credential.protocols.mqtt.username;
            mqttOptions.password = credential.protocols.mqtt.password;
          }
          mqttOptions.will = {
            topic: `/wisepaas/scada/${this._options.scadaId}/conn`,
            payload: JSON.stringify(new LastWillMessage()),
            qos: 1,
            retain: true
          };

          mqttOptions.reconnectPeriod = this._options.reconnectInterval;
          const client = mqtt.connect(mqttOptions);
          resolve(client);
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  _connectMQTTorDCCS
};
