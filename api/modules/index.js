'use strict';

module.exports = function (app) {

  const init = require('./init');

  const cron = require('./cron')(app)();

  const admin = require('./admin')(app);

  const adminUser = require('./adminUser')(app);

  const globalConfig = require('./globalConfig')(app);

  const session = require('./session')(app);

  const notification = require('./notification')(app);



  return {
    init,
    cron,
    admin,
    globalConfig,
    session,
    adminUser,
    notification,
  };

};