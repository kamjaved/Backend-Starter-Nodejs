'use strict';
/**
 * This module handles all functionality of Notification
 * @module Modules/Notification
 */
module.exports = function (app) {

  /**
   * Notification Model
   * @type {Mongoose.Model}
   */
  const Notification = app.models.Notification;

  /**
   * Changes the status of the notification
   * @param  {Object} notificationDoc     Updated notification doc
   * @return {Promise}                    The promise
   */
  const markAsRead = function (notificationDoc) {
    return notificationDoc.save();
  };

  /**
   * Fetches the notification list
   * @param {Object} options        The options
   * @return {Promise}              The promise
   */
  const getNotificationList = function (options) {
    return Notification.pagedFind(options);
  };

  /**
   * Fetches notification details
   * @param {Object} notificationId     The notification object Id
   * @return {Promise}                  The promise
   */
  const getNotificationDetails = function (notificationId) {
    return Notification.findOne({
      _id: notificationId
    })
      .exec();
  };

  /**
   * Fetches unread notification count
   * @param {Object} query              query object
   * @return {Promise}                  The promise
   */
  const unreadNotificationCount = function (query) {
    return Notification.countDocuments(query).exec();
  };

  return {
    'list': getNotificationList,
    'get': getNotificationDetails,
    'markAsRead': markAsRead,
    'unreadNotificationCount': unreadNotificationCount
  };
};