'use strict';

///////////////////////////////////////////////////
// THIS IS THE ROUTE FILE FOR ADMIN USER MODULE //
///////////////////////////////////////////////////

/**
 * The express router
 * @type {Express.Router}
 */
const router = require('express').Router();

/**
 * @param  {Express} app     The express app reference
 * @param  {Object}  options The options for this module
 * @return {Object}          The revealed module
 */
module.exports = function (app, options) {

  /**
   * The JSON-Schema for these APIs
   * @type {Object}
   */
  const schemaValidator = require('./schema-validator')(app);

  /**
   * The Controllers for these APIs
   * @type {Object}
   */
  const controllers = require('./controller')(app);
  /**
   * The Common Middlewares for these APIs
   * @type {Object}
   */
  const commonMiddlewares = require('../../common/middleware')(app);

  /**
   * Notification list
   */
  router.get('/list', [
    options.validateQuery(schemaValidator.listQuery),
    controllers.list
  ]);
  router.get('/unread-count', [
    controllers.unreadCount
  ]);
  router.route('/:notificationId')
    .all([options.validateParams(schemaValidator.param)])
    .get(controllers.get)
    .put([
      commonMiddlewares.validateId('Notification', 'notificationId'),
      controllers.markAsRead
    ]);


  return router;
};