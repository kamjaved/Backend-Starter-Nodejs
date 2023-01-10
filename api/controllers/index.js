'use strict';

const router = require('express').Router();

module.exports = function(app) {

  const schemaValidators = {
    'common': require('./common/schema-validator')(app)
  };


  /**
   * Attaching to app for ease
   * @type {Object}
   */
  app.apiSchema = schemaValidators;


  /**
   * All the middlewares in this project
   * @type {Object}
   */
  const middlewares = {
    'common': require('./common/middleware')(app)
  };

  /**
   * Attaching to app for ease
   * @type {Object}
   */
  app.middlewares = middlewares;

  /**
   * All the API routes in this project
   * @type {Object}
   */
  const routes = {

    'admin': require('./admin')(app),
    'common': require('./common/route.js')(app),

  };

  ///////////////////////////////////////////////
  // Attaching the body-parser module for json //
  ///////////////////////////////////////////////
  router.all('*', require('body-parser').json());

  router.use('/account*', app.middlewares.common.headerValidator(), app.middlewares.common.tokenValidator());

  /**
   * Public routes
   */
  // router.use('/trip', routes.common.public);

  /** 
   * Admin Routes 
   */
  router.use('/admin', app.middlewares.common.headerValidator(), routes.admin.public);


  router.use('/account/admin', app.middlewares.common.checkSession(app.config.user.role.admin), app.middlewares.common.checkUserAccess(app.config.user.role.admin), routes.admin.private);

  return router;
};