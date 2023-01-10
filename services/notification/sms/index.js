'use strict';

class SNS {
  constructor(config) {
    this.aws = require('aws-sdk');
    this.sns = new this.aws.SNS(config);
  }

  send(sentTo, body = '') {
    return this.sns.publish({ Message: body, MessageStructure: 'string', PhoneNumber: sentTo }).promise();
  }
}

class Twilio {
  constructor(config) {
    this.twilio = require('twilio');
    this.config = config;
    this.client = this.twilio(config.accountSid, config.authToken);
    this.fromNumber = config.fromNumber;
    // this.clientCapability = this.twilio.jwt.ClientCapability;
    // this.voiceResponse = this.twilio.twiml.VoiceResponse;
  }

  send(to, message) {
    return this.client.messages.create({
      body: message,
      to: to,
      from: this.fromNumber,
    });
  }
}

module.exports = function() {
  return {
    sns: SNS,
    twilio: Twilio
  };
};