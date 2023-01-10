'use strict';
/**
 * This Controller handles all functionality of admin common routes
 * @module Controllers/Admin/Common
 */
module.exports = (app) => {
  /**
   * Search for UrPC code
   * @param  {Object}   req  Request 
   * @param  {Object}   res  Response
   * @param  {Function} next Next is used to pass control to the next middleware function
   * @return {Promise}       The Promise
   */
  const getUpcCode = (req, res, next) => {
    app.module.upcSection.searchUpcCode(req.query.searchKey, req.query.riderId)
      .then((output) => {
        req.workflow.outcome.data = output;
        req.workflow.emit('response');
      })
      .catch(next);
  };

  return { getUpcCode };
};