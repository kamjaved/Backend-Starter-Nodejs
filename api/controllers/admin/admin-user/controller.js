'use strict';

/**
 * This Controller handles all functionality of admin user
 * @module Controllers/Admin/Admin-User
 */

module.exports = function (app) {

  /**
   * adminUser Module
   * @type {Object}
   */
  const adminUser = app.module.adminUser;

  /**
   * Session Module
   * @type {Object}
   */
  const session = app.module.session;

  /**
   * Adds an admin
   * @param  {Object}   req  Request 
   * @param  {Object}   res  Response
   * @param  {Function} next Next is used to pass control to the next middleware function
   * @return {Promise}       The Promise
   */
  const addAdminUser = (req, res, next) => {
    adminUser.add(req.body)
      .then(output => {
        req.workflow.emit('response');
      })
      .catch(next);
  };

  /**
   * Fetches an admin
   * @param  {Object}   req  Request 
   * @param  {Object}   res  Response
   * @param  {Function} next Next is used to pass control to the next middleware function
   * @return {Promise}       The Promise
   */
  const getAdminUser = (req, res, next) => {
    adminUser.get(req.adminUserId)
      .then(output => {
        req.workflow.outcome.data = output;
        req.workflow.emit('response');
      })
      .catch(next);
  };

  /**
   * Fetches a list of admin users
   * @param  {Object}   req  Request 
   * @param  {Object}   res  Response
   * @param  {Function} next Next is used to pass control to the next middleware function
   * @return {Promise}       The Promise
   */
  const getAdminUserList = (req, res, next) => {
    let query = {
      skip: Number(req.query.skip) || app.config.page.defaultSkip,
      limit: Number(req.query.limit) || app.config.page.defaultLimit,
      filters: {
        accountStatus: {
          $ne: app.config.user.accountStatus.admin.deleted
        }
      },
      sort: {},
      populate: {
        'path': 'roleInfo.roleId'
      },
      keys: '-authenticationInfo'
    };

    if (req.body.filters) {
      let { name, email, roleInfo } = req.body.filters;
      if (name) {
        query.filters['personalInfo.fullName'] = new RegExp(`^${name}`, 'ig');
      }
      if (email) {
        query.filters['personalInfo.email'] = new RegExp(`^${email}`, 'ig');
      }
      if (roleInfo) {
        query.filters.roleInfo = roleInfo;
      }
    }
    if (req.body.sortConfig) {
      let { name, email } = req.body.sortConfig;
      if (name) {
        query.sort['personalInfo.fullName'] = name;
      }
      if (email) {
        query.sort['personalInfo.email'] = email;
      }
    }

    adminUser.list(query)
      .then(output => {
        req.workflow.outcome.data = output;
        req.workflow.emit('response');
      })
      .catch(next);
  };

  /**
   * Edits an admin
   * @param  {Object}   req  Request 
   * @param  {Object}   res  Response
   * @param  {Function} next Next is used to pass control to the next middleware function
   * @return {Promise}       The Promise
   */
  const editAdminUser = (req, res, next) => {
    req.adminUserId.personalInfo = req.body.personalInfo;
    req.adminUserId.roleInfo = req.body.roleInfo;
    adminUser.edit(req.adminUserId)
      .then(output => {
        return app.module.session.remove(req.adminUserId._id, app.config.user.role.admin)
          .then(() => output);
      })
      .then(output => {
        req.workflow.emit('response');
      })
      .catch(next);
  };

  /**
   * Deletes a Admin User
   * @param  {Object}   req  Request 
   * @param  {Object}   res  Response
   * @param  {Function} next Next is used to pass control to the next middleware function
   * @return {Promise}       The Promise
   */
  const deleteAdminUser = (req, res, next) => {
    adminUser.remove(req.adminUserId)
      .then(output => {
        req.workflow.emit('response');
      })
      .catch(next);
  };
  /**
     * Changes(Suspend) the status of an Admin User
     * @param  {Object}   req  Request 
     * @param  {Object}   res  Response
     * @param  {Function} next Next is used to pass control to the next middleware function
     * @return {Promise}       The Promise
     */
  const changeStatus = (req, res, next) => {

    if (!req.session.user.roleInfo.isSuperAdmin) {
      return next({ 'errCode': 'N0_ACCESS' });
    }
    if (req.adminUserId.roleInfo.isSuperAdmin) {
      return next({ 'errCode': 'SUPER_ADMIN_CANNOT_BE_SUSPENDED' });
    }
    adminUser.changeStatus(req.adminUserId, req.body)
      .then(output => {
        if (req.body.accountStatus === app.config.user.accountStatus.admin.blocked) {
          return session.remove(req.adminUserId._id, app.config.user.role.admin).then(() => output);
        } else {
          return output;
        }
      })
      .then(output => {
        req.workflow.outcome.data = app.utility.format.admin(output);
        req.workflow.emit('response');
      })
      .catch(next);
  };

  return {
    add: addAdminUser,
    get: getAdminUser,
    edit: editAdminUser,
    list: getAdminUserList,
    delete: deleteAdminUser,
    changeStatus: changeStatus
  };

};