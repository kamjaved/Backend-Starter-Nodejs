'use strict';

module.exports = {

  'uri': {

    'development': process.env.DB_DEV_URL,

    'testing': process.env.DB_TEST_URL,

    'production': process.env.DB_PRODUCTION_URL,
  },

  'maxSessionAge': 60 * 60 * 1000
};