'use strict';

module.exports = function(app) {

  const login = {
    'email': {
      type: 'string',
      required: true,
      allowEmpty: false,
      format: 'email'
    },
    'password': {
      type: 'string',
      required: true
    }
  };

  /////////////////////
  // Forgot Password //
  /////////////////////
  const forgotPasswordRequestOTP = {
    'email': {
      type: 'string',
      required: true,
      allowEmpty: false,
      format: 'email'
    }
  };

  const forgotPasswordVerifyOTP = {
    'email': {
      type: 'string',
      required: true,
      allowEmpty: false,
      format: 'email'
    },
    'otp': {
      type: 'string',
      required: true,
      length: 6
    },
    'password': {
      type: 'string',
      required: true
    }
  };



  return {
    'login': login,
    'forgotPassword': {
      'requestOTP': forgotPasswordRequestOTP,
      'verifyOTP': forgotPasswordVerifyOTP
    }
  };

};