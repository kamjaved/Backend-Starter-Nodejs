'use strict';

/**
 * This Controller handles all functionality of admin notification
 * @module Controllers/Admin/Notification
 */
module.exports = function (app) {

  /**
   * notification Module
   * @type {Object}
   */
  const notification = app.module.notification;

  /**
   * Fetches a list of Notifications
   * @param  {Object}   req  Request 
   * @param  {Object}   res  Response
   * @param  {Function} next Next is used to pass control to the next middleware function
   * @return {Promise}       The Promise
   */
  const getNotificationList = function (req, res, next) {
    let options = {
      skip: Number(req.query.skip) || app.config.page.defaultSkip,
      limit: Number(req.query.limit) || app.config.page.defaultLimit,
      'filters': {
        'user': req.session.user._id,
        'medium': app.config.notification.medium.inApp,
      },
      'sort': {
        'createdAt': -1
      },
      'keys': 'sentTime seen inAppContent'
    };
    notification
      .list(options)
      .then(output => {
        return notification.unreadNotificationCount({
          'user': req.session.user._id,
          'medium': app.config.notification.medium.inApp,
          'seen': false
        })
          .then(count => {
            output.unreadNotificationCount = count;
            req.workflow.outcome.data = output;
            req.workflow.emit('response');
          });
      })
      .catch(next);
  };

  /**
   * Changes the status of the notification
   * @param  {Object}   req  Request 
   * @param  {Object}   res  Response
   * @param  {Function} next Next is used to pass control to the next middleware function
   * @return {Promise}       The Promise
   */
  const markAsRead = function (req, res, next) {
    req.notificationId.seen = true;
    notification
      .markAsRead(req.notificationId)
      .then(() => {
        req.workflow.emit('response');
      })
      .catch(next);
  };

  /**
   * Get details of the notification
   * @param  {Object}   req  Request 
   * @param  {Object}   res  Response
   * @param  {Function} next Next is used to pass control to the next middleware function
   * @return {Promise}       The Promise
   */
  const getNotificationDetails = function (req, res, next) {
    notification
      .get(req.params.notificationId)
      .then((output) => {
        req.workflow.outcome.data = output;
        req.workflow.emit('response');
      })
      .catch(next);
  };

  const unreadCount = (req, res, next) => {
    notification
      .unreadNotificationCount({ 'user': req.session.user._id, 'seen': false })
      .then((output) => {
        req.workflow.outcome.data = output;
        req.workflow.emit('response');
      })
      .catch(next);
  };

  return {
    'list': getNotificationList,
    'get': getNotificationDetails,
    'markAsRead': markAsRead,
    'unreadCount': unreadCount
  };

};