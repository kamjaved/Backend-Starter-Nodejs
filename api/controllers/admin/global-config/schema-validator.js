'use strict';

module.exports = function(app) {
  /////////////
  // edit   //
  /////////////

  const edit = {
    'termsAndCondition': {
      type: 'string',
      allowEmpty: false,
      format: 'url'
    },
    'privacyPolicy': {
      type: 'string',
      allowEmpty: false,
      format: 'url'
    },
    'aboutUs': {
      type: 'string',
      allowEmpty: false,
      format: 'url'
    },
    'supportContactNo': {
      type: 'string',
      allowEmpty: false,
    },
    'supportEmail': {
      type: 'string',
      allowEmpty: false,
      format: 'email'
    },
    'invitationMessageForRider': {
      type: 'string',
      allowEmpty: false,
      required: true
    },
    'playStoreLink': {
      type: 'object',
      properties: {
        'rider': {
          type: 'string',
          allowEmpty: false,
          format: 'url'
        },
        'driver': {
          type: 'string',
          allowEmpty: false,
          format: 'url'
        }
      }
    },
    'appleStoreLink': {
      type: 'object',
      properties: {
        'rider': {
          type: 'string',
          allowEmpty: false,
          format: 'url'
        },
        'driver': {
          type: 'string',
          allowEmpty: false,
          format: 'url'
        }
      }
    },
  };

  return {
    'edit': edit

  };

};