'use strict';

module.exports = function(app) {

  const bcrypt = require('bcryptjs');
  const nanoId = require('nanoid');
  const Puid = require('puid');

  /**
   * utility namespace
   * 
   * @namespace utility
   *
   * @property {HandleFile}          handleFile instance of CustomDate Class
   * @property {DateHelper}          dateHelper instance of DateHelper Class
   * @property {Message}             message    instance of Message Class
   * @property {language.getMessage} getLang    acquiring client language 
   * @property {module:Workflow}     workflow   acquiring the workflow
   */
  var utility = {
    'handleFile': require('./ex-file-handle'),
    'dateHelper': require('./dateHelper'),
    'message': require('./message'),
    'workflow': require('./workflow'),
    's3Util': require('./awsS3')(app.config.aws.s3),
    'apiValidate': require('./api-validate'),
    'upload': require('./upload'),
    'stripe': require('./stripe')(process.env.NODE_ENV === 'production' ? app.config.stripe.live.secret : app.config.stripe.test.secret),
    // 'braintree': require('./braintree')(process.env.NODE_ENV === 'production' ? app.config.braintree.live : app.config.braintree.test),
    'errorHandler': require('./errorHandler')(app), // attached as middleware in app
    'awsSNS': require('./awsSNS')(app.config.aws.SNS),
  };


  /**
   * Generate OTP 
   * @param  {Number} length The Length
   * @return {Number}        Otp
   * @memberOf utility
   */
  utility.generateOTP = function(length) {
    let otp = (Math.random() * Math.pow(10, length)).toFixed();
    if (otp.length < length) {
      otp += Array(length - otp.length).fill(0).join('');
    }
    return otp;
  };

  /**
   * Get Country Code 
   * @param  {String} countryCode The Country Code
   * @return {String}             Country Code
   * @memberOf utility
   */
  utility.getCountryCode = function(countryCode) {
    return app.config.countryCode.countryList[countryCode];
  };

  /**
   * Generate a unique name
   * @return {String}             return a unique name generated by using puid library
   * @memberOf utility
   */
  utility.generateUniqueKey = function(isShort) {
    let puid = new Puid(isShort);
    return puid.generate();
  };

  /**
   * Executes mkdir -p "nested_folder_names" in the shell
   * @param  {String}   folderList The "/" separated nested folder names
   * @param  {Function} cb         The callback
   * NOTE: Requires ES6
   */
  utility.mkdirR = function(folderList, cb) {
    require('child_process').exec(`mkdir -p "${folderList}"`, {}, cb);
  };

  /**
   * Start Mqtt server
   * @param  {Function} cb Callback
   * @memberOf utility
   */
  utility.startMqttServer = function(cb) {
    require('child_process').exec(`mosquitto -c /etc/mosquitto/mosquitto.conf`, {}, cb);
  };

  ///////////////////////////////////////////
  // File Upload, Get, Remove, File handle  //
  ///////////////////////////////////////////

  /**
   * Upload File from locals 
   * @param  {Object}   config   The Config Object
   * @param  {Function} callback The Callback Function
   * @return {Promise}       The Promise or Callback
   * @memberOf utility
   */
  utility.uploadFile = function(config, callback) { //TODO: check relevance

    // return callback(null, utility.s3Util.getUrl({
    //   bucket: config.bucket,
    //   key: config.key
    // }));
    config.bucket = config.bucket || app.config.aws.s3.bucket;

    let key = (process.env.NODE_ENV === 'development' ? 'dev/' : 'prod/');
    key = key + config.key;

    if (callback && typeof callback === 'function') {

      utility.s3Util.uploadInS3({
        bucket: config.bucket,
        key: key,
        path: config.path,
        ACL: 'public-read'
      }, function(err) {
        if (err) {
          callback(err);
        } else {
          callback(null, utility.s3Util.getUrl({
            bucket: config.bucket,
            key: key
          }));
        }
      });

    } else {
      return new Promise((resolve, reject) => {
        utility.s3Util.uploadInS3({
          bucket: config.bucket,
          key: key,
          path: config.path,
          ACL: 'public-read'
        }, function(err) {
          if (err) {
            reject(err);
          } else {
            utility.s3Util.getUrl({
              bucket: config.bucket,
              key: key
            }, (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            });
          }
        });

      });
    }
  };

  /**
   * Get a File from amazon s3 bucket
   * @param  {[type]}   link     s3 link
   * @param  {Function} callback Callback
   * @return {Promise}       The Promise or Callback
   * @memberOf utility
   */
  utility.getFile = function(link, callback) {

    link = link.substr(link.indexOf('//') + 2);
    if (callback && typeof callback === 'function') {
      utility.s3Util.getObject({
        key: link.substr(link.indexOf('/') + 1),
        bucket: link.substr(0, link.indexOf('.'))
      }, function(err, data) {
        if (err) {
          callback(err);
        } else {
          callback(null, data);
        }
      });

    } else {

      return new Promise((resolve, reject) => {
        utility.s3Util.getObject({
          key: link.substr(link.indexOf('/') + 1),
          bucket: link.substr(0, link.indexOf('.'))
        }, (err, data) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        });
      });

    }
  };

  /**
   * Remove a File from amazon s3 bucket
   * @param  {[type]}   link     s3 link 
   * @param  {Function} callback Callback 
   * @return {Promise}       The Promise or Callback
   * @memberOf utility
   */
  utility.removeFile = function(link, callback) {

    link = link.substr(link.indexOf('//') + 2);

    if (callback && typeof callback === 'function') {
      utility.s3Util.removeObject({
        key: link.substr(link.indexOf('/') + 1),
        bucket: link.substr(0, link.indexOf('.'))
      }, function() {
        callback(null, true);
      });
    } else {

      return new Promise((resolve, reject) => {
        utility.s3Util.removeObject({
          key: link.substr(link.indexOf('/') + 1),
          bucket: link.substr(0, link.indexOf('.'))
        }, (err) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(true);
          }
        });
      });
    }

  };

  /**
   * Handles the file deletion
   * @param  {Object}  files     The files object from request
   * @param  {Boolean} [isError] Whether the request has errors, or is successful
   * @memberOf utility
   */
  utility.fileHandler = function(files, isError) {

    if (!files) {
      return;
    }

    let fieldList = Object.keys(files);

    fieldList.forEach(each => {

      if (!Array.isArray(files[each])) {
        files[each] = [files[each]];
      }

      files[each].forEach(file => {

        if (isError) {

          require('fs').unlink(file.path, () => {});

          if (app.config.aws.s3) { // file must be on S3

            utility.removeFile(file.getPath, () => {});
          } else {
            require('fs').unlink(file.getPath, () => {});
          }
        } else {

          if (file.path !== file.getPath) {
            require('fs').unlink(file.path, () => {});
          }
        }
      });
    });
  };


  /**
   * this function attaches the workflow instance to each request obejct and execute the next queued function
   * @param  {object}   req    request object 
   * @param  {object}   res    response object
   * @param  {Function} next   next queued function 
   * @memberOf utility
   */
  utility.attachWorkflow = function(req, res, next) {
    req.workflow = req.app.utility.workflow(req, res);
    next();
  };

  /**
   * this function generate the encrypted password over the set password
   * @param  {String}         password    password of the manager
   * @function .encryptPassword
   * @memberOf utility
   */
  utility.encryptPassword = function(password) {
    return bcrypt.genSalt(10).then((salt) => bcrypt.hash(password, salt));
  };

  /**
   * this function matches the password and return whether the password matches or not
   * @param  {String}          password    passowrd of the manager
   * @param  {String}          hash        encrypted passowrd
   * @function .validatePassword
   * @memberOf utility
   */
  utility.validatePassword = function(password, hash) {
    return bcrypt.compare(password, hash);
  };

  /**
   * This function parse the value and return the equivalent Boolean value
   * if the values are not satisfied condition it returns null
   * @param  {mixed}   value     the value that needs to be checked 
   * @return {null}              if the function does not find the equivalent Boolean
   * @return {true}              if the valus os true or 'true'
   * @return {false}             if the valus os false or 'false'
   * @memberOf utility
   */
  utility.checkBoolean = function(value) {
    switch (value) {
      case 1:
      case true:
      case '1':
      case 'true':
        return true;
      case 0:
      case false:
      case '0':
      case 'false':
        return false;
      default:
        return null;
    }
  };

  /**
   * Check Gender 
   * @param  {String} value The Gender Value
   * @return {Boolean}  True/False
   * @memberOf utility     
   */
  utility.checkGender = function(value) {
    return isFinite(value) ? Object.keys(app.config.user.gender).map(each => app.config.user.gender[each]).includes(Number(value)) : false;
  };


  /**
   * Get random code
   * @param  {Number} length length of the random staring
   * @return {String}        random string
   * @memberOf utility
   */
  utility.getRandomCode = function(length, isPassword) {
    const codeString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12345678';
    let output = '',
      index;

    if (!length) {
      length = 6;
    }
    for (var i = 0; i < length; i++) {
      index = Math.floor(Math.random() * codeString.length);

      if (index === 1) {
        index = index - 1;
      }
      output += codeString[index];
    }
    if (isPassword) {
      output = output + 'A1a';
    }
    return output;
  };

  /**
   * Calculate year difference between 2 dates
   * @param  {Date} firstDate first date object
   * @param  {Date} lastDate last date object
   * @return {Number}         Age difference
   * @memberOf utility
   */
  utility.calculateAge = function(firstDate, lastDate) {
    let ageDifMs = lastDate - firstDate.getTime();
    let ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  /**
   * Get Unique Id by nanoid
   * @param  {Number} length Length of generated Id
   * @return {String}        Generated Id
   * @memberOf utility
   */
  utility.getNanoId = function(length) {
    return nanoId('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length || 10).toUpperCase();
  };

  /**
   * check value is a mongoose id or not
   * @memberOf utility
   */
  utility.checkMongooseObjectId = function(value) {
    return value && value.toString().length === 24 && require('mongoose').Types.ObjectId.isValid(value);
  };

  /**
   * Utility Format 
   * @memberOf utility
   */
  utility.format = {
    admin: function(adminObj) {
      var newAdminObj = JSON.parse(JSON.stringify(adminObj));
      delete newAdminObj.authenticationInfo.password;
      delete newAdminObj.authenticationInfo.otp;
      delete newAdminObj.authenticationInfo;
      delete newAdminObj.sessionInfo;
      return newAdminObj;
    }
  };

  /**
   * isValidate 
   * @memberOf utility
   */
  utility.isValidate = {
    'email': function(email) {
      return /^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/g.test(email);
    },
    'phoneNumber': function(mobile) {
      // return /^[2-9][0-9]*$/g.test(mobile);
      // return /^\d{10}$/g.test(mobile);
      return /^[0-9]*$/g.test(mobile);
    },
    countryCode: function(countryCode) {
      return /^(\+)\d{1,4}$/g.test(countryCode);
    },
    'password': function(password) {
      /** at least one capital,one small,one number and one special char and minimum 8 digit */
      return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\S]{8,}$/g.test(password);
    },
    'isNumber': function(input) {
      return isFinite(input);
    },
    'isString': function(input) {
      return (typeof input === 'string' && !isFinite(input) && input !== '');
    },
    'isURL': function(input) {
      return /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(input);
    },
    'isNameComponent': function(input) {
      return /^([a-zA-z]+\s?)*\s*$/g.test(input);
    },
    'isSingaporeICNumber': function(value) {
      return /^[A-Z]\d{7}[A-Z]$/g.test(value);
    },
    'dateTimeFormat': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?((?:[\+\-]\d{2}\d{2})|Z)$/,
    'colorHexCode': function(colorCode) {
      return /^#([A-Fa-f0-9]{6})$/g.test(colorCode);
    },
    'isUserAccountType': function(value) {
      return /^[1-2]*$/g.test(value);
    },
    'isGeoLocation': function(value) {
      const longitude = value[0];
      const latitude = value[1];
      return (longitude >= -180 && longitude <= 180) && (latitude >= -90 && latitude <= 90);
    },
    'isBoolean': function(value) {
      switch (value) {
        case 1:
        case true:
        case '1':
        case 'true':
        case 0:
        case false:
        case '0':
        case 'false':
          return true;
        default:
          return null;
      }
    }
  };

  return utility;
};