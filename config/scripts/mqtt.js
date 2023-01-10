'use strict';

module.exports = {

  'connecturl': {

    'development': {
      host: process.env.MQTT_HOST,
      port: +process.env.MQTT_PORT,
      // username: 'userName',
      // password: 'password#'
    },

    'testing': {
      host: process.env.MQTT_HOST,
      port: +process.env.MQTT_PORT,
      // username: 'userName',
      // password: 'password#'
    },

    'production': {
      host: process.env.MQTT_HOST,
      port: +process.env.MQTT_PORT,
      // username: 'userName',
      // password: 'password#'
    },
  }
};