'use strict';

module.exports = {

  'sms': {
    'accountSid': process.env.TWILIO_ACCOUNT_SID,
    'authToken': process.env.TWILIO_AUTH_TOKEN,
    'fromNumber': process.env.TWILIO_FROM_NUMBER,
  }
};