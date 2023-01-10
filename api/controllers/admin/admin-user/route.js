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
   * The Common Middlewares for these APIs
   * @type {Object}
   */
  const commonMiddlewares = require('../../common/middleware')(app);

  /**
   * The Controllers for these APIs
   * @type {Object}
   */
  const controllers = require('./controller')(app);

  /**
   * Adds an admin
   */
  router.post('/add', [
    options.validateBody(schemaValidator.add),
    commonMiddlewares.checkAdminRoleAccess([{
      'moduleName': 'admin',
      'role': 2
    }]),
    controllers.add
  ]);

  /**
   * Fetches a list of admin
   */
  router.post('/list', [
    options.validateQuery(schemaValidator.listQuery),
    options.validateBody(schemaValidator.list),
    commonMiddlewares.checkAdminRoleAccess([{
      'moduleName': 'admin',
      'role': 1
    }]),
    controllers.list
  ]);

  /**
   * Fetches an admin, edits an admin and removes an admin
   */
  router.route('/:adminUserId')
    .all([
      options.validateParams(schemaValidator.param),
      commonMiddlewares.validateId('Admin', 'adminUserId')
    ])
    .get([
      commonMiddlewares.checkAdminRoleAccess([{
        'moduleName': 'admin',
        'role': 1
      }]),
      controllers.get
    ])
    .put([
      commonMiddlewares.checkAdminRoleAccess([{
        'moduleName': 'admin',
        'role': 2
      }]),
      options.validateBody(schemaValidator.edit),
      controllers.edit
    ])
    .delete([
      commonMiddlewares.checkAdminRoleAccess([{
        'moduleName': 'admin',
        'role': 3
      }]),
      controllers.delete
    ]);

  /**
     *  Changes(Suspend) the status of an Admin User
     */
  router.put('/change-status/:adminUserId', [
    options.validateParams(schemaValidator.param),
    commonMiddlewares.validateId('Admin', 'adminUserId'),
    controllers.changeStatus
  ]);

  return router;
};
