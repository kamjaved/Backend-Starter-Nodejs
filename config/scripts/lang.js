'use strict';

module.exports = {
  'defaultLanguage': 'en-us',
  'en-us': {
    'push': {
      'samplePush': {
        'title': 'New test Push',
        'pushBody': 'New Push Body'
      }
    },
    'email': {
      'sampleEmail': {
        'subject': 'subject',
        'greeting': 'Hi',
        'message': 'message'
      },
      'copyRightText': 'Copyright (c) UrPC'
    },
    'sms': {
      'sampleSms': function (data) {
        return `Hi ${data.name} this is sample sms`;
      }
    }
  }
};