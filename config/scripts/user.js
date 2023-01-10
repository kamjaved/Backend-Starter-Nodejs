'use strict';

module.exports = {

  'role': {
    'user': 1,
    'admin': 3,
  },
  'loginType': {
    'custom': 1,
    'facebook': 2,
    'twitter': 3
  },

  'deviceType': {
    'android': 1,
    'iOS': 2,
    'browser': 3
  },

  'accountStatus': {
    'user': {
      'active': 1,
      'blocked': 2,
      'deleted': 3
    },
    'admin': {
      'active': 1,
      'blocked': 2,
      'deleted': 3
    }
  },

  'sessionExpiredTime': 30 * 24 * 60 * 60 * 1000, // 1 month (in milliseconds)

  'otpExpiredTime': 24 * 60 * 60 * 1000, // 10 minutes (in milliseconds)

  'activeTime': 30 * 60 * 1000, //30 minutes (in milliseconds)


  'defaultAdmin': {
    'admins': [{
      'firstName': 'Souraj',
      'lastName': 'Sadhukhan',
      'email': 'souraj.sadhukhan@innofied.com'
    }, {
      'firstName': 'Rupal',
      'lastName': 'Chakrabarty',
      'email': 'rupal.chakrabarty@innofied.com'
    }, {
      'firstName': 'Rohan',
      'lastName': 'Das',
      'email': 'rohan.das@innofied.com'
    }],
    'password': process.env.ADMIN_DEFAULT_PASSWORD,
    'isSuperAdmin': true
  },

  'defaultCurrency': 'USD',

  'defaultLang': 'en-us',

  'addressBookType': {
    'home': 1,
    'work': 2,
    'others': 3
  },

};