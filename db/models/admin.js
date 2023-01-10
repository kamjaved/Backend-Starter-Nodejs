'use strict';
/**
 * Unique ID generation module
 * @type {Npm.Module}
 */
const Puid = require('puid');

module.exports = function(app, mongoose /*, plugins*/ ) {

  const adminSchema = new mongoose.Schema({
    /**
     * Personal Info
     */
    'personalInfo': {
      /**
       * First name
       */
      'firstName': {
        'type': String,
        'required': true
      },
      /**
       * Last name
       */
      'lastName': {
        'type': String,
        'required': true
      },
      /**
       * Full Name
       */
      'fullName': {
        'type': String
      },
      /**
       * Profile pic link
       */
      'profilePicture': String,

      /**
       * Email address
       */
      'email': {
        'type': String,
        'required': true
      }
    },
    /**
     * Authentication Info
     */
    'authenticationInfo': {
      /**
       * Password string
       */
      'password': {
        'type': String,
        'required': true
      },
      /**
       * OTP object
       */
      'otp': {
        /**
         * Code string
         */
        'code': String,

        /**
         * Time at which OTP will become invalid
         */
        'timeout': Date
      }
    },
    /**
     * Role Info
     */
    'roleInfo': {
      'isSuperAdmin': {
        'type': Boolean,
        'required': true
      },
      'roleId': {
        'type': mongoose.Schema.Types.ObjectId,
        'ref': 'Role'
      }
    },
    /**
     * Account Status
     */
    'accountStatus': {
      'type': Number,
      'required': true,
      'default': app.config.user.accountStatus.admin.active
    },
    /**
     * Settings
     */
    'settings': {
      'selectedLanguage': {
        'type': String,
        'default': app.config.user.defaultLang
      },
      'timeZoneOffset': {
        'type': Number
      }
    },
    /** 
     * Session Information
     */
    'sessionInfo': {
      'deviceId': {
        'type': String
      },
      'deviceType': {
        'type': Number
      },
      'token': {
        'type': String
      },
      'destroyTime': {
        'type': Date
      }
    }

  }, {
    'versionKey': false,
    'timestamps': true,
    'autoIndex': true
  });

  adminSchema.on('init', function(model) {
    // Checking Session timeout every minute
    setInterval(() => {
      model.update({
          'sessionInfo.destroyTime': {
            $lte: new Date()
          }
        }, {
          '$unset': {
            'sessionInfo': 1
          }
        }, {
          multi: true
        })
        .exec()
        .catch(console.log);
    }, 24 * 60 * 1000); // Run every min
  });

  /**
   * Pre Hook to save name as full
   * @param  {Object} next) {                     this.fullName The Full Name
   */
  adminSchema.pre('save', function(next) {
    this.personalInfo.fullName = this.personalInfo.firstName + ' ' + this.personalInfo.lastName;
    next();
  });

  /**
   * Custom login details validation
   * @param  {String} email    The email address
   * @param  {String} password The password
   * @return {Promise}         The promise
   */
  adminSchema.statics.loginValidate = function(email, password) {

    return this.findOne({
        'personalInfo.email': email,
        'accountStatus': {
          '$ne': app.config.user.accountStatus.admin.deleted
        }
      })
      .exec()
      .then((adminDoc) => adminDoc ? Promise.resolve(adminDoc) : Promise.reject({
        'errCode': 'ADMIN_NOT_FOUND'
      }))
      .then((adminDoc) => app.utility.validatePassword(password, adminDoc.authenticationInfo.password)
        .then((result) => result ? Promise.resolve(adminDoc) : Promise.reject({
          'errCode': 'PASSWORD_MISMATCH'
        })))
      .then((adminDoc) => adminDoc.accountStatus !== app.config.user.accountStatus.admin.blocked ? Promise.resolve(adminDoc) : Promise.reject({
        'errCode': 'ADMIN_HAS_BEEN_SUSPENDED'
      }))
      .then((adminDoc) => {
        return Promise.resolve({
          'userDoc': adminDoc,
          'userType': app.config.user.role.admin
        });
      });
  };

  /**
   * Creates a new OTP for forgot password
   * @param  {String}  email The email
   * @return {Promise}       The promise
   */
  adminSchema.statics.forgotPasswordCreateOTP = function(email) {

    return this.findOne({
        'personalInfo.email': email,
        'accountStatus': {
          '$ne': app.config.user.accountStatus.admin.deleted
        }
      })
      .exec()
      .then((adminDoc) => adminDoc ? Promise.resolve(adminDoc) : Promise.reject({
        'errCode': 'ADMIN_NOT_FOUND'
      }))
      .then((adminDoc) => adminDoc.accountStatus !== app.config.user.accountStatus.admin.blocked ? Promise.resolve(adminDoc) : Promise.reject({
        'errCode': 'ADMIN_HAS_BEEN_SUSPENDED'
      }))
      .then((adminDoc) => {

        adminDoc.authenticationInfo.otp = {
          'code': app.utility.generateOTP(6),
          'timeout': new Date((new Date()).getTime() + (60 * 60 * 1000))
        };

        return adminDoc.save().then((adminDoc) => {
          ////////////////////////////////////////
          //TODO: Send OTP for forgot password  //
          ///////////////////////////////////////
          // let emailNotification = app.config.notification.email(app, adminDoc.settings.selectedLanguage),
          //   multilangConfig = app.config.lang[adminDoc.settings.selectedLanguage];
          // // create email template
          // app.render(emailNotification.adminForgotPassword.pageName, {
          //   'greeting': multilangConfig.email.adminForgotPassword.greeting,
          //   'firstName': adminDoc.personalInfo.firstName,
          //   'message': multilangConfig.email.adminForgotPassword.message,
          //   'otpText': multilangConfig.email.adminForgotPassword.otpText,
          //   'otp': adminDoc.authenticationInfo.otp.code
          // }, function(err, renderedText) {
          //   if (err) {
          //     console.log(err);
          //   } else {
          //     // send email
          //     app.service.notification.email.immediate({
          //       userId: adminDoc._id,
          //       userType: app.config.user.role.admin,
          //       emailId: adminDoc.personalInfo.email,
          //       subject: emailNotification.adminForgotPassword.subject,
          //       body: renderedText
          //     });
          //   }
          // });

          return Promise.resolve(adminDoc.authenticationInfo.otp);
        });
      });
  };

  /**
   * Verifies the OTP and sets the new password
   * @param  {String}  email    The email
   * @param  {String}  otp      The OTP to be verified
   * @param  {String}  password The new password to be set
   * @return {Promise}          The promise
   */
  adminSchema.statics.forgotPasswordVerifyOTP = function(email, otp, password) {

    return this.findOne({
        'personalInfo.email': email,
        'accountStatus': {
          '$ne': app.config.user.accountStatus.admin.deleted
        }
      })
      .exec()
      .then((adminDoc) => adminDoc ? Promise.resolve(adminDoc) : Promise.reject({
        'errCode': 'ADMIN_NOT_FOUND'
      }))
      .then((adminDoc) => adminDoc.accountStatus !== app.config.user.accountStatus.admin.blocked ? Promise.resolve(adminDoc) : Promise.reject({
        'errCode': 'ADMIN_HAS_BEEN_SUSPENDED'
      }))
      .then((adminDoc) => {

        let savedOTP = {
          'code': adminDoc.authenticationInfo.otp.code,
          'timeout': adminDoc.authenticationInfo.otp.timeout
        };

        if (new Date() < savedOTP.timeout) {
          if (savedOTP.code === otp) {
            //////////////////////////
            // Unset the otp object //
            //////////////////////////
            adminDoc.update({
              '$unset': {
                'authenticationInfo.otp': 1
              }
            }).exec();
            return Promise.resolve(adminDoc);
          } else {
            return Promise.reject({
              'errCode': 'OTP_INVALID'
            });
          }
        } else {
          //////////////////////////
          // Unset the otp object //
          //////////////////////////
          adminDoc.update({
            '$unset': {
              'authenticationInfo.otp': 1
            }
          }).exec();
          return Promise.reject({
            'code': 'OTP_TIMEDOUT'
          });
        }
      })
      .then((adminDoc) => app.utility.encryptPassword(password)
        .then((hash) => {
          adminDoc.authenticationInfo.password = hash;
          return adminDoc.save();
        }));
  };

  /**
   * Checks whether a document exists according to a condition
   * @param  {Object} query   The query object
   * @return {Promise}        The Promise
   */
  adminSchema.statics.exists = function(query) {
    return this.countDocuments(query).exec();
  };

  /**
   * Adds an admin to the system
   * @param  {Object} adminObj    The admin object to be added
   * @return {Promise}            The Promise
   */
  adminSchema.statics.addAdmin = function(adminObj) {
    // let password = app.utility.getRandomCode(8, true);
    let password = process.env.ADMIN_DEFAULT_PASSWORD;
    return app.utility.encryptPassword(password)
      .then((password) => {
        adminObj.authenticationInfo = {
          password: password
        };
        return new this(adminObj).save();
      }).then((adminObj) => {
        ///////////////////////////////////////
        //Send email to newly created Admin    //
        ///////////////////////////////////////
        // let emailNotification = app.config.notification.email(app, adminObj.settings.selectedLanguage),
        //   multilangConfig = app.config.lang[adminObj.settings.selectedLanguage];
        // // create email template
        // app.render(emailNotification.adminAddedByAdmin.pageName, {
        //   'greeting': multilangConfig.email.adminAddedByAdmin.greeting,
        //   'firstName': adminObj.personalInfo.firstName,
        //   'message': multilangConfig.email.adminAddedByAdmin.message,
        //   'emailText': multilangConfig.email.adminAddedByAdmin.emailText,
        //   'email': adminObj.personalInfo.email,
        //   'passwordText': multilangConfig.email.adminAddedByAdmin.passwordText,
        //   'password': password
        // }, function (err, renderedText) {
        //   if (err) {
        //     console.log(err);
        //   } else {
        //     // send email
        //     app.service.notification.email.immediate({
        //       userId: adminObj._id,
        //       userType: app.config.user.role.admin,
        //       emailId: adminObj.personalInfo.email,
        //       subject: emailNotification.adminAddedByAdmin.subject,
        //       body: renderedText
        //     });
        //   }
        // });
        ////////
        //End //
        ////////
        return Promise.resolve(adminObj);
      });
  };

  //////////////////////
  // Session Handling //
  //////////////////////

  /**
   * Returns an unique token
   * @return {String} The unique token
   */
  const getToken = function() {
    let puid = new Puid();
    return puid.generate();
  };

  /**
   * Returns the destroy time of a session
   * @return {Number} The destroy time for a session
   */
  const getDestroyTime = function() {
    return new Date(new Date().getTime() + app.config.user.sessionExpiredTime);
  };

  /**
   * Handles the session token and returns it, with or without the user data and status data
   * @param  {Boolean} getUserInfo True, if user data and status data are to be retrieved
   * @return {Promise}             The Promise
   */
  const handleSessionToken = function(getUserInfo) {

    return function(adminDoc) {
      if (!getUserInfo) {
        return Promise.resolve({
          'token': adminDoc.sessionInfo.token
        });
      } else {
        return adminDoc
          .populate({
            'path': 'roleInfo.roleId'
          })
          .execPopulate()
          .then(adminDoc => Promise.resolve({
            'token': adminDoc.sessionInfo.token,
            'userType': app.config.user.role.admin,
            'userId': adminDoc,
            'deviceId': adminDoc.sessionInfo.deviceId
          }));
      }
    };
  };

  /**
   * Creates a new session
   * @param  {Number}   deviceType            The device type
   * @param  {String}   deviceId              The device id
   * @param  {Object}   userDoc               The user document
   * @return {Promise}                        The Promise
   */
  adminSchema.statics.createSession = function(deviceType, deviceId, userDoc) {

    let sessionInfo = {
      'deviceType': deviceType,
      'token': getToken(),
      'destroyTime': getDestroyTime(),
      'deviceId': deviceId
    };

    userDoc.sessionInfo = sessionInfo;

    return this.removeSessionByDeviceId(deviceId)
      .then(() => this.removeSessionByUserId(userDoc._id))
      .then(() => (userDoc.save()))
      .then(handleSessionToken(true));
  };

  /**
   * Validates a session
   * @param  {String}  token       The unique token
   * @param  {Number}  deviceType  The device type
   * @param  {String}  deviceId    The device id
   * @param  {Boolean} getUserInfo True, if user doc is to be retrieved along with token
   * @return {Promise}             The Promise
   */
  adminSchema.statics.validateSession = function(token, deviceType, deviceId, getUserInfo) {

    return this.findOne({
        'sessionInfo.token': token,
        'sessionInfo.deviceId': deviceId,
        'sessionInfo.deviceType': deviceType,
        'sessionInfo.destroyTime': {
          '$gt': new Date()
        }
      })
      .exec()
      .then((adminDoc) => {

        if (!adminDoc) {
          return Promise.reject({
            'errCode': 'SESSION_NOT_FOUND'
          });
        }

        if (adminDoc.accountStatus === app.config.user.accountStatus.admin.blocked) {
          return Promise.reject({
            'errCode': 'ADMIN_HAS_BEEN_SUSPENDED'
          });
        }

        if (adminDoc.accountStatus === app.config.user.accountStatus.admin.deleted) {
          return Promise.reject({
            'errCode': 'ADMIN_HAS_BEEN_DELETED'
          });
        }

        adminDoc.sessionInfo.destroyTime = getDestroyTime();

        return adminDoc.save().then(handleSessionToken(getUserInfo || true));
      });
  };

  /**
   * Removes a session by its userId
   * @param  {String}  userId      The ObjectId of the user
   * @return {Promise}             The Promise
   */
  adminSchema.statics.removeSessionByUserId = function(userId) {

    return this.update({
      '_id': userId
    }, {
      $unset: {
        sessionInfo: 1
      }
    }).exec();
  };

  adminSchema.statics.removeSessionByDeviceId = function(deviceId) {

    return this.update({
      'sessionInfo.deviceId': deviceId
    }, {
      $unset: {
        sessionInfo: 1
      }
    }).exec();
  };

  adminSchema.statics.removeSession = function(token, deviceType, deviceId) {

    return this.update({
        'sessionInfo.deviceId': deviceId,
        'sessionInfo.token': token,
        'sessionInfo.deviceType': deviceType,
      }, {
        $unset: {
          sessionInfo: 1
        }
      })
      .exec();

  };

  return adminSchema;
};