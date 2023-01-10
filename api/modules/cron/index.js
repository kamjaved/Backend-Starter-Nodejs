'use strict';

module.exports = function (app) {


  const mqttHealthChecker = require('./scripts/mqtt-health-checker-cron');


  function executeCron() {
    if (process.env.DISABLE_CRON === 'false') {
      if ((process.env.hasOwnProperty('NODE_APP_INSTANCE') && process.env.NODE_APP_INSTANCE === '0') || (!process.env.hasOwnProperty('NODE_APP_INSTANCE'))) {
        mqttHealthChecker(app);
      }
    }
  }
  return executeCron;
};