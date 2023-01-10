'use strict';

module.exports = function(app) {


  /**
   * Get Global Config
   * @param  {Object}   req  Request 
   * @param  {Object}   res  Response
   * @param  {Function} next Next is used to pass control to the next middleware function
   * @return {Promise}       The Promise
   */
  const getGlobalConfig = function(req, res, next) { // jshint ignore:line

    /**
     * projectionObj Projection Query
     * @type {Object}
     */
    let projectionObj = {
      '_id': 0,
      'updatedAt': 0,
      'createdAt': 0
    };

    app.module.globalConfig.get(req.session.userType)
      .then(output => {
        req.workflow.outcome.data = output;
        req.workflow.emit('response');
      })
      .catch(next);
  };

  return {
    'getGlobalConfig': getGlobalConfig,
  };
};