'use strict';

class SNS {
  constructor(config) {
    const aws = require('aws-sdk');
    const sns = new aws.SNS(config);
    this.sns = sns;
    this.params = {};
  }

  sendSMS(sentTo, body, cb) {
    var params = {
      Message: body || '',
      MessageStructure: 'string',
      PhoneNumber: sentTo
    };

    return this.sns.publish(params).promise();

  }
}

module.exports = function(config) {
  return new SNS(config);
};