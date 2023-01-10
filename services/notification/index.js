'use strict';

module.exports = function(app, smsGateway) {
  /**
   * The email notification module
   */
  const email = require('./email/ses.js')(app);


  /**
   * The push notification module
   */
  const push = require('./push')(app);

  /**
   * The sms  module
   */
  const Sms = require('./sms')();

  const smsClient = smsGateway === app.config.notification.smsGateway.twilio ? new Sms.twilio(app.config.twilio.sms) : new Sms.sns(app.config.aws.SNS);
  /**
   * The notification schema
   */
  const Notification = app.models.Notification;

  /**
   * Returns the model name for the given user type
   * @param  {Number} userType The user type
   * @return {String}          The model name
   */
  const getUserModelName = function(userType) {

    let userRole = Object.keys(app.config.user.role).filter((each) => (app.config.user.role[each] === userType))[0];

    switch (userRole) {
      case 'admin':
        return 'Admin';
    }
  };

  /**
   * Send an email immediatedly
   * @param  {String} options.userId   The user Id
   * @param  {Number} options.userType The user type
   * @param  {String} options.emailId  The email
   * @param  {String} options.subject  The subject of the email
   * @param  {Object} options.body     The body of the email
   * @return {Promise}                 The promise
   */
  const immediateEmail = function({ emailId, subject, body }) {

    return email({
      'to': emailId,
      'subject': subject,
      'renderedOutput': body
    }).then((output) => {
      return Promise.resolve(output);
    }).catch((err) => {
      return Promise.reject(err);
    });
  };

  /**
   * Sends an in app notification
   * @param  {String} options.userId   The user Id
   * @param  {Number} options.userType The user type
   * @param  {Object} options.content  The content for notification
   * @return {Promise}                 The promise
   */
  const sendInAppNotification = function({ userId, userType, content }) {

    let notificationObj = {
      'user': userId,
      'userType': userType,
      'medium': app.config.notification.medium.inApp,
      'inAppContent': content,
      'sent': true,
      'sentTime': new Date()
    };
    return new Notification(notificationObj).save();
  };

  /**
   * Send an email immediately
   * @param  {String} options.userId   The user Id
   * @param  {Number} options.userType The user type
   * @param  {String} options.sentTo  The phone number the sms will be sent to
   * @param  {Object} options.body     The body of the sms
   * @return {Promise}                 The promise
   */
  const immediateSms = function(sentTo, body) {
    return smsClient.send(sentTo, body).then((output) => {
      return Promise.resolve(output);
    }).catch((err) => {
      return Promise.reject(err);
    });
  };
  // immediateSms('+919851343527', 'testBody3').then(console.log).catch(console.log);
  // const accountSid = 'ACc9a610b7ad048c388bcdd512a6dea213';
  // const authToken = '9af78ecbc9c6422f81a43657c94b2eaa';
  // const client = require('twilio')(accountSid, authToken);

  // client.messages
  //   .create({
  //     body: 'testBody2',
  //     from: '+15034069145',
  //     to: '+919851343527'
  //   })
  //   .then(message => console.log(message.sid))
  //   .done();
  /**
   * Sends push notification to Android Devices
   * @param  {String} androidDeviceId The Android device Id
   * @param  {Number} userType        The user type
   * @param  {String} title           The title of the push notification
   * @param  {Object} body            The body of the push notification
   * @param  {Object} optionalData    The additional data
   * @return {Promise}                 The promise
   */
  function sendPushToAndroid(androidDeviceId, title, body, optionalData = {}) {
    let configForFCM = {
      'serverKey': app.config.notification.fcm.serverKey,
      'androidDeviceId': androidDeviceId,
      'title': title,
      'body': body,
      'optionalData': optionalData
    };
    return new Promise((resolve, reject) => {
      return push.sendFCM(configForFCM)
        .then((result) => {
          console.log('result', result);
          return resolve();
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  /**
   * Sends push notification to iOS Devices
   * @param  {String} iOSDeviceId     The iOS device Id
   * @param  {Number} userType        The user type
   * @param  {String} title           The title of the push notification
   * @param  {Object} body            The body of the push notification
   * @param  {Object} optionalData    The additional data
   * @return {Promise}                 The promise
   */
  function sendPushToiOSDevice(iOSDeviceId, userType, title, body, optionalData) {
    const iOSDeviceIdList = [iOSDeviceId];
    let configForAPN = app.config.notification.apn;

    if (userType === app.config.user.role.rider) {
      configForAPN.bundleId = app.config.notification.bundleIdForRiderApp;
    } else {
      configForAPN.bundleId = app.config.notification.bundleIdForDriverApp;
    }

    configForAPN.message = {
      alert: {
        title: title,
        body: body
      },
      data: optionalData
    };
    configForAPN.devices = iOSDeviceIdList;
    return new Promise((resolve, reject) => {
      return push.sendAPN(configForAPN)
        .then((result) => {
          console.log('send Apn result', result);
          if (result[0] && result[0].sent.length) {
            resolve();
          } else {
            console.log('send Apn result error', JSON.stringify(result));
            reject(result[0].failed[0]);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Checks and sends push notification to a specific device type
   * @param  {String} options.userId    The user Id
   * @param  {Number} options.userType  The user type
   * @param  {String} options.title     The title of the push notification
   * @param  {Object} body              The body of the push notification
   * @param  {Object} optionalData      The additional data
   * @return {Promise}                  The promise
   */
  const checkAndSendPush = function({ userId, userType, title, body, optionalData = {} }) {

    app.models[getUserModelName(userType)].findOne({
        '_id': userId,
        'sessionInfo.destroyTime': {
          $gte: new Date()
        }
      })
      .select({ 'sessionInfo': 1 })
      .then(doc => doc.sessionInfo ? Promise.resolve(doc.sessionInfo) : Promise.reject({ 'errCode': 'SESSION_NOT_FOUND' }))
      .then(doc => {
        if (doc.deviceType === app.config.user.deviceType.android) {
          return sendPushToAndroid(doc.notificationKey, title, body, optionalData);
        } else if (doc.deviceType === app.config.user.deviceType.iOS) {
          return sendPushToiOSDevice(doc.notificationKey, userType, title, body, optionalData);
        } else {
          return Promise.reject();
        }
      })
      .catch((err) => {
        return Promise.resolve(err);
      });
  };

  /**
   * Sends all unsent notifications
   * @return {Promise} The promise
   */
  const sendAllNotifications = function() {
    return Notification
      .find({
        'sent': false,
        'medium': {
          '$in': [app.config.notification.medium.push, app.config.notification.medium.email]
        }
      })
      .select({
        updatedAt: 0,
        createdAt: 0
      })
      .exec()
      .then(notifications => {

        notifications.map(each => {

          if (each.medium === app.config.notification.medium.push) {
            app.models[getUserModelName(each.userType)].findOne({
                '_id': each.userId,
                'sessionInfo.destroyTime': {
                  $gte: new Date()
                }
              })
              .select({ 'sessionInfo': 1 })
              .then(doc => doc.sessionInfo ? Promise.resolve(doc.sessionInfo) : Promise.reject({ 'errCode': 'SESSION_NOT_FOUND' }))
              .then(doc => {
                each.pushContent.device = doc.notificationKey;
                if (doc.deviceType === app.config.user.deviceType.android) {
                  return sendPushToAndroid(doc.notificationKey, each.pushContent.title, each.pushContent.body, each.pushContent.optionalData);
                } else if (doc.deviceType === app.config.user.deviceType.iOS) {
                  return sendPushToiOSDevice(doc.notificationKey, each.pushContent.title, each.pushContent.body, each.pushContent.optionalData);
                } else {
                  return Promise.reject();
                }
              })
              .then(() => {
                each.sent = true;
                each.seen = true;
                each.sentTime = new Date();
                each.save();
              })
              .catch(console.log);
          } else if (each.medium === app.config.notification.medium.email) {
            return email({
                to: each.emailContent.to,
                subject: each.emailContent.subject,
                renderedOutput: each.emailContent.body
              }).then((output) => {
                each.sent = true;
                each.seen = true;
                each.sentTime = new Date();
                each.save();
              })
              .catch(console.log);
          }
        });
      })
      .catch(console.log);
  };

  /**
   * Marks a notification as read
   * @param  {String}  notificationId The notification Id
   * @return {Promise}                The Promise
   */
  const markAsRead = function(notificationIdList) {
    notificationIdList = notificationIdList || [];
    return Notification.update({
        '_id': {
          '$in': notificationIdList
        }
      }, {
        '$set': {
          'seen': true
        }
      }, {
        'multi': true
      })
      .exec();
  };

  /**
   * Gets notifications for a user
   * @param  {String}  userId   The user Id
   * @param  {Number}  userType The user type
   * @return {Promise}          The Promise
   */
  const getNotifications = function(userId, userType) {

    let query = {
      'userId': userId,
      'userType': userType,
      'medium': app.config.notification.medium.inApp,
      'sentTime': {
        '$lte': new Date().getTime(),
        '$gte': new Date().getTime() - 7 * 24 * 60 * 60 * 1000 // show upto 7 days
      }
    };

    return Notification.find(query).exec()
      .then((notificationList) => {
        markAsRead(notificationList.map((each) => each._id));
        return Promise.resolve(notificationList);
      });
  };

  /**
   * Gets notification count for a user
   * @param  {String}  userId   The user Id
   * @param  {Number}  userType The user type
   * @param  {Boolean} [isSeen] True, if should retrieve only seen notifications. False, for only unseen notifications
   * @return {Promise}          The Promise
   */
  const getNotificationsCount = function(userId, userType, isSeen) {

    let query = {
      'userId': userId,
      'userType': userType,
      'medium': app.config.notification.medium.inApp,
      'sentTime': {
        '$lte': new Date().getTime()
      },
      'seen': false
    };
    if (isSeen) {
      query.seen = true;
    } else if (isSeen === false) {
      query.seen = false;
    }

    return Notification.countDocuments(query);
  };

  /**
   * Sets a notification as sent
   * @param  {String}  notificationId The notification Id
   * @return {Promise}                The Promise
   */
  const setAsSent = function(notificationId) {
    return Notification.update({
        '_id': notificationId
      }, {
        '$set': {
          'sent': true
        }
      })
      .exec();
  };

  /**
   * Deletes a notification
   * @param  {String}  notificationId The notification Id
   * @return {Promise}                The Promise
   */
  function deleteNotification(notificationId) {
    return Notification.remove({
        '_id': notificationId
      })
      .exec();
  }

  return {
    'email': {
      'immediate': immediateEmail
    },
    'push': {
      'checkAndSendImmediate': checkAndSendPush
    },
    'inApp': {
      'send': sendInAppNotification
    },
    'sms': {
      'immediate': immediateSms
    },
    'sendAll': sendAllNotifications,
    'get': getNotifications,
    'setAsSent': setAsSent,
    'markAsRead': markAsRead,
    'delete': deleteNotification,
    'count': getNotificationsCount,
  };
};