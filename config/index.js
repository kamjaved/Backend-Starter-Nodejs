'use strict';

module.exports = function( /*app*/ ) {

  const config = {
    'project': require('./scripts/project'),
    'server': require('./scripts/server'),
    'page': require('./scripts/page'),
    'lang': require('./scripts/lang'),
    'mqtt': require('./scripts/mqtt'),
    'countryCode': require('./scripts/country-phone'),
    'user': require('./scripts/user'),
    'globalConfig': require('./scripts/global-config'),
    'aws': require('./scripts/aws'),
    'twilio': require('./scripts/twilio'),
    'notification': require('./scripts/notification'),
    'stripe': require('./scripts/stripe'),
    'other': require('./scripts/other'),
    'payment': require('./scripts/payment'),
    'adminRole': require('./scripts/admin-role'),
    'braintree': require('./scripts/braintree'),
  };

  return config;
};