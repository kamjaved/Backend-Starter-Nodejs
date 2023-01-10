'use strict';

/**
 * creates utility functions for handling braintree requests
 * @class
 * @param {string} config    api key of braintree
 */
class BrainTree {

  constructor(config) {
    const braintree = require('braintree');
    this.gateway = braintree.connect({
      environment: (process.env.NODE_ENV === 'production') ? braintree.Environment.Production : braintree.Environment.Sandbox,
      merchantId: config.merchantId,
      publicKey: config.publicKey,
      privateKey: config.privateKey
    });
  }


  /**
   * Create a customer in Braintree
   * @this   BrainTree
   * @param  {Object} config                  An object which contains all the required data
   * @param  {string} config.email          Valid email where the invoice will be sent.
   * @description There are a lot of fields you can add in config. For details please visit "https://developers.braintreepayments.com/reference/request/customer/create/node"
   */
  createCustomer(config) {
    return this.gateway.customer.create(config);
  }

  /**
   * Get customer details in Braintree
   * @this   BrainTree
   * @param  {Object} config                  An object which contains all the required data
   * @param  {string} config.email          Valid email where the invoice will be sent.
   * @description There are a lot of fields you can add in config. For details please visit "https://developers.braintreepayments.com/reference/request/customer/create/node"
   */
  getCustomer(customerId) {
    return this.gateway.customer.find(customerId);
  }

  /**
   * Delete a customer details in Braintree
   * @this   BrainTree
   * @param  {Object} config                  An object which contains all the required data
   * @param  {string} config.email          Valid email where the invoice will be sent.
   * @description There are a lot of fields you can add in config. For details please visit "https://developers.braintreepayments.com/reference/request/customer/create/node"
   */
  removeCustomer(customerId) {
    return this.gateway.customer.delete(customerId);
  }

  /**
   * Create a client token for client SDK initialization in Braintree
   * @this   BrainTree
   * @param  {string} customerId          Valid customer id of the payment gateway
   * @description There are a lot of fields you can add in config. For details please visit "https://developers.braintreepayments.com/reference/request/client-token/generate/node"
   */
  createClientToken(customerId) {
    return this.gateway.clientToken.generate({ customerId: customerId })
      .then(res => Promise.resolve(res.clientToken));
  }

  /**
   * Create a payment method in Braintree
   * @this   BrainTree
   * @param  {Object} config                  An object which contains all the required data
   * @param  {string} config.email          Valid email where the invoice will be sent.
   * @description There are a lot of fields you can add in config. For details please visit "https://developers.braintreepayments.com/guides/payment-methods/node"
   */
  createPaymentMethod(customerId, paymentMethodNonce) {
    return this.gateway.paymentMethod.create({
      customerId: customerId,
      paymentMethodNonce: paymentMethodNonce,
      options: {
        makeDefault: true
      }
    });
  }

  /**
   * Delete a payment method in Braintree
   * @this   BrainTree
   * @param  {Object} config                  An object which contains all the required data
   * @param  {string} config.email          Valid email where the invoice will be sent.
   * @description There are a lot of fields you can add in config. For details please visit "https://developers.braintreepayments.com/guides/payment-methods/node"
   */
  removePaymentMethod(paymentMethodToken) {
    return this.gateway.paymentMethod.delete(paymentMethodToken);
  }

  /**
   * Create a subscription in Braintree
   * @this   BrainTree
   * @param  {Object} config          object containing different subscription parameters
   * @description There are a lot of fields you can add in config. For details please visit "https://developers.braintreepayments.com/reference/request/subscription/create/node"
   */
  addSubscription(config) {
    return this.gateway.subscription.create(config);
  }

  /**
   * Update a subscription in Braintree
   * @this   BrainTree
   * @param  {string} subscriptionId          Valid subscription ID
   * @param  {Object} config          object containing different subscription parameters
   * @description There are a lot of fields you can add in config. For details please visit "https://developers.braintreepayments.com/reference/request/subscription/update/node"
   */
  updateSubscription(subscriptionId, config) {
    return this.gateway.subscription.update(subscriptionId, config);
  }

  /**
   * Cancel subscription in Braintree
   * @this   BrainTree
   * @param  {string} subscriptionId          Valid subscription ID
   * @description There are a lot of fields you can add in config. For details please visit "https://developers.braintreepayments.com/reference/request/subscription/cancel/node"
   */
  cancelSubscription(subscriptionId) {
    return this.gateway.subscription.cancel(subscriptionId);
  }

  /**
   * Get subscription details in Braintree
   * @this   BrainTree
   * @param  {string} subscriptionId          Valid subscription ID
   * @description There are a lot of fields you can add in config. For details please visit "https://developers.braintreepayments.com/reference/request/subscription/find/node"
   */
  getSubscription(subscriptionId) {
    return this.gateway.subscription.find(subscriptionId);
  }

  charge({ amount, paymentMethodToken, deviceData }) {
    let config = {
      amount: amount,
      paymentMethodToken: paymentMethodToken,
      deviceData: deviceData,
      options: {
        submitForSettlement: true
      }
    };
    return this.gateway.transaction.sale(config);
  }

  webhookValidation(signature, payload, callback) {
    return this.gateway.webhookNotification.parse(signature, payload, callback);
  }

}

/**
 * Exporting Braintree instance with all the methods
 * @param  {Object} config   contains merchantId, publicKey, privateKey
 * @return {Object}          Instance of Braintree constructor.
 */
module.exports = function(config) {
  return new BrainTree(config);
};