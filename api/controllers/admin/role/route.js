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
   * Adds a role
   */
  router.post('/add', [
    commonMiddlewares.checkAdminRoleAccess([{
      'moduleName': 'role',
      'role': 2
    }]),
    options.validateBody(schemaValidator.add),
    controllers.add
  ]);

  /**
   * Fetches a list of roles
   */
  router.post('/list', [
    commonMiddlewares.checkAdminRoleAccess([{
      'moduleName': 'role',
      'role': 1
    }]),
    options.validateQuery(schemaValidator.listQuery),
    options.validateBody(schemaValidator.list),
    controllers.list
  ]);

  /**
   * Fetches a role, edits a role and removes a role
   */
  router.route('/:roleId')
    .all([
      options.validateParams(schemaValidator.param),
      commonMiddlewares.validateId('Role', 'roleId')
    ])
    .get([
      commonMiddlewares.checkAdminRoleAccess([{
        'moduleName': 'role',
        'role': 1
      }]),
      controllers.get
    ])
    .put([
      commonMiddlewares.checkAdminRoleAccess([{
        'moduleName': 'role',
        'role': 2
      }]),
      options.validateBody(schemaValidator.edit),
      controllers.edit
    ])
    .delete([
      commonMiddlewares.checkAdminRoleAccess([{
        'moduleName': 'role',
        'role': 3
      }]),
      controllers.delete
    ]);


  return router;
};