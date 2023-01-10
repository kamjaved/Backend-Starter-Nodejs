'use strict';
//////////////////////////////////////////////////////////////////
// THIS UTILITY FILE IS FOR STRIPE VERSION 2017-05-25 AND ABOVE //
//////////////////////////////////////////////////////////////////

/**
 * creates utility functions for handling stripe requests
 * @class
 * @param {string} stripeApiKey    api key of stripe
 */
class Stripe {
  constructor(stripeApiKey) {
    this.stripe = require('stripe')(stripeApiKey);
    this.stripe.setApiVersion('2017-06-05');
  }

  /**
   * Create a customer
   * @this   Stripe
   * @param  {Object} config                  An object which contains all the required data
   * @param  {string} config.source           The token you get after saving the card at stripe
   * @param  {string} config.id           Id of the selected plan, If you want to create a customer only then omit this field.
   * @param  {string} config.email          Valid email where the invoice will be sent.
   * @param  {requestCallback} [callback]         The callback that handles the response.
   * @description There are a lot of fields you can add in config. For details please visit "https://stripe.com/docs/api#create_customer"
   */
  createCustomer(config) {
    return this.stripe.customers.create(config);
  }

  getCustomer(customerId) {
    return this.stripe.customers.retrieve(customerId);
  }

  updateCustomer(customerId, updateObj) {
    return this.stripe.customers.update(customerId, updateObj);
  }

  /**
   * Remove a Customer
   * @param {string} customerId             Id of a customer
   * @param {requestCallback} callback            The callback that handles the response.
   */

  removeCustomer(customerId) {
    return this.stripe.customers.del(customerId);
  }

  /**
   * [createManagedAccount description]
   * @param  {[type]}   countryCode [description]
   * @param  {[type]}   email       [description]
   * @param  {Function} callback    [description]
   * @return {[type]}               [description]
   */
  createManagedAccount(countryCode, email) {
    return this.stripe.accounts.create({
      type: 'custom',
      country: countryCode || 'US',
      email: email
    });
  }


  enablePayoutForCustomAccount(accountId, stripeAccountUpdateObj) {
    return this.stripe.accounts.update(accountId, stripeAccountUpdateObj);
  }

  /**
   * Update Managed Account 
   * @param  {String}   accountId Stripe Custom Account Id
   * @param  {String}   email     Email
   * @param  {Function} callback  [description]
   * @return {[type]}             [description]
   */
  updateManagedAccount(accountId, email) {
    return this.stripe.accounts.update(accountId, {
      'email': email
    });
  }


  getAccount(accountId) {
    return this.stripe.accounts.retrieve(accountId);
  }

  /**
   * [removeManagedAccount description]
   * @param  {[type]}   accountId [description]
   * @param  {Function} callback  [description]
   * @return {[type]}             [description]
   */
  removeManagedAccount(accountId) {
    return this.stripe.accounts.del(accountId);
  }

  addCard(customerId, cardToken) {
    return this.stripe.customers.createSource(customerId, {
      source: cardToken
    });
  }


  getCardList(customerId, config) {
    let configObj = {
      'limit': config.limit || 10,
      'include[]': 'total_count'
    };
    if (config.startingAfter) {
      configObj['starting_after'] = config.startingAfter; // jshint ignore:line
    }
    return this.stripe.customers.listCards(customerId, configObj);
  }

  changeDefaultCard(customerId, cardId) {
    return this.stripe.customers.update(customerId, {
      'default_source': cardId
    });
  }

  removeCard(customerId, cardId) {
    return this.stripe.customers.deleteCard(customerId, cardId);
  }

  addBankAccount(accountId, bankToken) {
    return this.stripe.accounts.createExternalAccount(accountId, {
      'external_account': bankToken
    });
  }

  getBankAccountList(accountId, config) {
    let configObj = {
      'limit': config.limit || 10,
      'object': 'bank_account',
      'include[]': 'total_count'
    };
    if (config.startingAfter) {
      configObj['starting_after'] = config.startingAfter; // jshint ignore:line
    }
    return this.stripe.accounts.listExternalAccounts(accountId, configObj);
  }

  changeDefaultBankAccountForCurrency(accountId, bankAccountId) {
    return this.stripe.accounts.updateExternalAccount(accountId, bankAccountId, {
      default_for_currency: true
    });
  }

  removeBankAcount(accountId, bankAccountId) {
    return this.stripe.accounts.deleteExternalAccount(accountId, bankAccountId);
  }

  /**
   * Charge from customer by card or direct
   * @param  {String} customerId customer id
   * @param  {Number} amount   Amount to be deducted (in cent)
   * @param  {String} currency Currency code mentioned by stripe https://stripe.com/docs/currencies
   * @param  {Object} config Other config
   * @param  {Function} [callback]  callback function
   * @return {Promise}          Promise if call back not provided
   */
  chargeCustomer(customerId, amount, currency, config) {
    let chargeObj = {
      'customer': customerId,
      'amount': amount,
      'currency': currency
    };
    if (config.destination) {
      chargeObj.destination = {
        'account': config.destination,
        'amount': config.amount
      };
    }
    if (config.source) {
      chargeObj.source = config.source;
    }

    return this.stripe.charges.create(chargeObj).then(data => {
      console.log('charge complete');
      return Promise.resolve(data);
    }).catch(err => {
      console.log(err);
      return Promise.reject(err);
    });
  }

  transferToManagedAccount(accountId, amount, currency, config) {
    let chargeObj = {
      'destination': accountId,
      'amount': amount,
      'currency': currency
    };
    return this.stripe.transfers.create(chargeObj);
  }

  refundCharge(chargeId, amount) {
    return this.stripe.refunds.create({
      'charge': chargeId,
      'amount': amount
    });
  }

  getBalance(config) {
    let configObj = {};
    if (config.stripeAccountId) {
      configObj['stripe_account'] = config.stripeAccountId; // jshint ignore:line
    }

    return this.stripe.balance.retrieve(configObj);
  }

  addSubscriptionPlan(config) {
    return this.stripe.plans.create(config);
  }

  editSubscriptionPlan(planId, config) {
    return this.stripe.plans.update(planId, config);
  }

  deleteSubscriptionPlan(planId) {
    return this.stripe.plans.del(planId);
  }

  addSubscription(config) {
    return this.stripe.subscriptions.create(config);
  }

  updateSubscription(subscriptionId, config) {
    return this.stripe.subscriptions.update(subscriptionId, config);
  }

  cancelSubscription(subscriptionId) {
    return this.stripe.subscriptions.del(subscriptionId);
  }

  getSubscription(subscriptionId) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  payInvoice(invoiceId) {
    return this.stripe.invoices.pay(invoiceId);
  }

  deleteSource(customerId, source) {
    return this.stripe.customers.deleteSource(customerId, source);
  }

  createBankToken(callback) {
    return this.stripe.tokens.create({
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_type: 'individual',
        routing_number: '110000000',
        account_number: '000123456789'
      }
    });
  }
}

/**
 * Exporting Stripe instance with all the methods
 * @param  {string} stripeApiKey api key given by stripe
 * @return {Object}              Instance of Stripe constructor.
 */
module.exports = function(stripeApiKey) {
  return new Stripe(stripeApiKey);
};