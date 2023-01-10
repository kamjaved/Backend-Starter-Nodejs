'use strict';

module.exports = {

  'test': {
    'secret': process.env.STRIPE_TEST_SECRET,
    'endpointSecret': process.env.STRIPE_TEST_ENDPOINT_SECRET
  },
  'live': {
    'secret': process.env.STRIPE_LIVE_SECRET,
    'endpointSecret': process.env.STRIPE_LIVE_ENDPOINT_SECRET
  },

  'default': {
    'countryCode': 'US',
    'currencyCode': 'USD'
  }
};