'use strict';

module.exports = {
  'medium': {
    'email': 1,
    'sms': 2,
    'push': 3,
    'inApp': 4
  },
  'fcm': {
    serverKey: process.env.FCM_SERVER_KEY
  },
  'apn': {
    sound: 'bingbong.aiff',
    badge: 1,
    // passPhrase: 'innofied',
    environment: process.env.PUSH_ENV === 'production' ? 'production' : 'sandbox',
    isProduction: process.env.PUSH_ENV === 'production' ? true : false,
    p8File: './certificates/apn/sample.p8',
    keyId: 'iosKeyId',
    teamId: 'iosTeamId',
    bundleId: '',
    expireInSec: 10
  },
  'bundleId': 'bundleIdForPUSH',
  smsGateway: {
    sns: 1,
    twilio: 2
  },
  'smsText': function(app, selectedLang) {
    return {
      'sampleSms': app.config.lang[selectedLang].sms.sampleSms
    };
  },
  'email': function(app, selectedLang) {
    return {
      'sampleEmail': {
        subject: app.config.lang[selectedLang].email.sampleEmail.subject,
        pageName: 'new-driver'
      }
    };
  },
  'push': function(app, selectedLang) {
    return {
      'samplePush': {
        title: app.config.lang[selectedLang].push.samplePush.title,
        pushBody: function() {
          return `${app.config.lang[selectedLang].push.samplePush.pushBody}`;
        },
        type: 'driver-accepted-trip'
      }
    };
  },
  'companyName': '',
  'companyURL': ''
};