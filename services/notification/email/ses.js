'use strict';

module.exports = function (app) {

  /**
   * Requiring AWS module
   */
  const aws = require('aws-sdk');

  /**
   * Setting the config data
   */
  aws.config.update(app.config.aws.SES);

  /**
   * Creating a new instance of AWS SES
   */
  const ses = new aws.SES({
    'apiVersion': '2010-12-01'
  });


  const sesEmail = function (options) {
    return ses.sendEmail({
      'Source': `${app.config.server.systemEmail.name} <${app.config.server.systemEmail.email}>`,
      'Destination': {
        'ToAddresses': [options.to]
      },
      'Message': {
        'Subject': {
          'Data': options.subject
        },
        'Body': {
          'Html': {
            'Data': options.renderedOutput
          }
        }
      }
    });
  };

  return sesEmail;
};