'use strict';

module.exports = function (app) {
  const notification = require('./notification')(app, app.config.notification.smsGateway.sns);
  const realtimeMessaging = require('./realtime-messaging/mqtt')(app);

  return {
    notification,
    realtimeMessaging
  };
};