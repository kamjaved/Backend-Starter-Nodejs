'use strict';

/**
 * The express router (factory function)
 * @type {Function}
 */
const expressRouter = require('express').Router;

/**
 * Route Components
 * @type {Object}
 */
const controllers = {

  /**
   * Auth Route
   */
  'auth': require('./auth/route'),

  /**
   * Profile Route
   */
  'profile': require('./profile/route'),
  /**
   * Profile Route
   */
  'common': require('./common/route'),

  /**
   * Global Config Route
   */
  'globalConfig': require('./global-config/route'),

  /**
   * Admin User Route
   */
  'adminUser': require('./admin-user/route'),

  /**
   * Role Management Route
   */
  'role': require('./role/route'),
  /**
   * Dashboard Route
   */
  'dashboard': require('./dashboard/route'),

  /**
   * Notification Route
   */
  'notification': require('./notification/route'),
};

module.exports = function(app) {

  const options = {

    /**
     * File upload handling middleware
     * @type {Function}
     */
    'upload': app.utility.upload,

    /**
     * Validates the request body
     * @type {Function}
     */
    'validateBody': app.utility.apiValidate.body,
    /**
     * Validates the request query
     * @type {Function}
     */
    'validateQuery': app.utility.apiValidate.query,

    /**
     * Validates the request param
     * @type {Function}
     */
    'validateParams': app.utility.apiValidate.params,

    /**
     * Validates the request files
     * @type {Function}
     */
    'validateFile': app.utility.apiValidate.file
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                                                                                               //
  // PUBLIC ROUTES                                                                                                                 //
  //                                                                                                                               //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const publicRouter = expressRouter();

  /**
   * Custom Login Module
   */
  publicRouter.use('/auth', controllers.auth(app, options));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                                                                                               //
  // PRIVATE ROUTES                                                                                                                //
  //                                                                                                                               //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const privateRouter = expressRouter();

  /**
   * Common API Route
   */
  privateRouter.use('/common', controllers.common(app, options));
  /**
   * Profile Route
   */
  privateRouter.use('/profile', controllers.profile(app, options));

  /**
   * Global Config Route
   */
  privateRouter.use('/global-config', controllers.globalConfig(app, options));

  /**
   * Role Management Route
   */
  privateRouter.use('/role', controllers.role(app, options));

  /**
   * Global Config Route
   */
  privateRouter.use('/global-config', controllers.globalConfig(app, options));

  /**
   * Admin User Route
   */
  privateRouter.use('/admin-user', controllers.adminUser(app, options));

  /**
   * Dashboard Route
   */
  privateRouter.use('/dashboard', controllers.dashboard(app, options));

  /**
   * Notification Route
   */
  privateRouter.use('/notification', controllers.notification(app, options));

  return {
    'public': publicRouter,
    'private': privateRouter
  };
};