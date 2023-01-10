'use strict';

/**
 * This module handles fetching data to be shown on admin dashboard
 * @module Modules/Admin/Dashboard
 */
module.exports = function(app) {

  /**
   * Get Dashboard data
   * @return {Promise} The promise
   */
  const getDashBoardData = () => {
    return Promise.resolve({ data: 'It works!' });
  };

  return {
    getDashBoardData
  };
};