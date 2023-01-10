'use strict';

module.exports = {

  'test': {
    merchantId: process.env.BRAINTREE_TEST_MERCHANTID,
    publicKey: process.env.BRAINTREE_TEST_PUBLICKEY,
    privateKey: process.env.BRAINTREE_TEST_PRIVATEKEY
  },
  'live': {
    merchantId: process.env.BRAINTREE_PROD_MERCHANTID,
    publicKey: process.env.BRAINTREE_PROD_PUBLICKEY,
    privateKey: process.env.BRAINTREE_PROD_PRIVATEKEY
  },


};